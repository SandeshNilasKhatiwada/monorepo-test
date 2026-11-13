import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { and, eq, isNull, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { user, refreshTokenSession } from '../db/schema.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }
    private async hashPassword(token: string): Promise<string> {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    private async issueToken(userId: string) {
        const accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')!;
        const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')!;
        const accessExpires = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as StringValue ?? '15m';
        const refreshExpires = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as StringValue ?? '30d';

        const accessToken = await this.jwtService.signAsync(
            { sub: userId },
            {
                secret: accessSecret,
                expiresIn: accessExpires,
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            { sub: userId },
            {
                secret: refreshSecret,
                expiresIn: refreshExpires,
            },
        );
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 30); // Set expiration date to 30 days from now

        await db.insert(refreshTokenSession).values({
            userId,
            refreshToken: await this.hashPassword(await refreshToken),
            expiresAt: expiredAt,
        });

        return { accessToken, refreshToken };
    }

    async register(registerDto: RegisterDto) {
        const normalizedEmail = registerDto.email.toLowerCase();
        const normalizedUsername = registerDto.username.toLowerCase();

        const existingUser = await db.query.user.findFirst({
            where: (u, { or, eq }) => or(eq(u.email, normalizedEmail),
                eq(u.name, normalizedUsername)),
        });

        if (existingUser) {
            throw new ConflictException('Email or username already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const [newUser] = await db.insert(user).values({
            name: normalizedUsername,
            email: normalizedEmail,
            passwordHash: hashedPassword,
        }).returning(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            }
        );
        const token = await this.issueToken(newUser.id);
        return { user: newUser, ...token };
    }
    async login(loginDto: LoginDto) {
        const normalizedEmail = loginDto.email.toLowerCase();
        const existingUser = await db.query.user.findFirst({
            where: (u, { eq }) => eq(u.email, normalizedEmail),
        });

        if (!existingUser) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatch = await bcrypt.compare(loginDto.password, existingUser.passwordHash);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const token = await this.issueToken(existingUser.id);
        return {
            user: {
                id: existingUser.id,
                username: existingUser.name,
                email: existingUser.email,
                createdAt: existingUser.createdAt,
            }, ...token
        };
    }
    async refreshToken(rawRefreshToken: string) {
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
        let payload: { sub: string }
        try {
            payload = await this.jwtService.verifyAsync(rawRefreshToken, { secret: refreshSecret });
            
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const hashedToken = await this.hashPassword(rawRefreshToken);
        const session = await db.query.refreshTokenSession.findFirst({
            where: and(
                eq(refreshTokenSession.refreshToken, hashedToken),
                isNull(refreshTokenSession.revokedAt),
            )
        })
        if (!session || new Date() > session.expiresAt) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        await db
            .update(refreshTokenSession)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokenSession.id, session.id));

        const token = await this.issueToken(payload.sub);
        return token;
    }
    async getUserById(userId: string) {
        const existingUser = await db.query.user.findFirst({
            where: (eq(user.id, userId)),
        });
        if (!existingUser) {
            throw new NotFoundException('User not found');
        }
        return {
            id: existingUser.id,
            username: existingUser.name,
            email: existingUser.email,
            createdAt: existingUser.createdAt,
        }
    }
}
