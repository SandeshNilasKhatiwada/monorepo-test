var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { user, refreshTokenSession } from '../db/schema.js';
let AuthService = class AuthService {
    jwtService;
    configService;
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async hashPassword(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async issueToken(userId) {
        const accessSecret = this.configService.getOrThrow('JWT_ACCESS_SECRET');
        const refreshSecret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
        const accessExpires = this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN') ?? '15m';
        const refreshExpires = this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN') ?? '30d';
        const accessToken = await this.jwtService.signAsync({ sub: userId }, {
            secret: accessSecret,
            expiresIn: accessExpires,
        });
        const refreshToken = await this.jwtService.signAsync({ sub: userId }, {
            secret: refreshSecret,
            expiresIn: refreshExpires,
        });
        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 30);
        await db.insert(refreshTokenSession).values({
            userId,
            refreshToken: await this.hashPassword(await refreshToken),
            expiresAt: expiredAt,
        });
        return { accessToken, refreshToken };
    }
    async register(registerDto) {
        const normalizedEmail = registerDto.email.toLowerCase();
        const normalizedUsername = registerDto.username.toLowerCase();
        const existingUser = await db.query.user.findFirst({
            where: (u, { or, eq }) => or(eq(u.email, normalizedEmail), eq(u.name, normalizedUsername)),
        });
        if (existingUser) {
            throw new ConflictException('Email or username already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const [newUser] = await db.insert(user).values({
            name: normalizedUsername,
            email: normalizedEmail,
            passwordHash: hashedPassword,
        }).returning({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        });
        const token = await this.issueToken(newUser.id);
        return { user: newUser, ...token };
    }
    async login(loginDto) {
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
    async refreshToken(rawRefreshToken) {
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(rawRefreshToken, { secret: refreshSecret });
        }
        catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const hashedToken = await this.hashPassword(rawRefreshToken);
        const session = await db.query.refreshTokenSession.findFirst({
            where: and(eq(refreshTokenSession.refreshToken, hashedToken), isNull(refreshTokenSession.revokedAt))
        });
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
    async getUserById(userId) {
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
        };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map