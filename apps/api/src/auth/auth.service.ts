import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { user } from '../db/schema.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
    async register(registerDto: RegisterDto) {
        const normalizedEmail = registerDto.email.toLowerCase();
        const existingUser = await db.select().from(user).where(
            or(
                eq(user.email, normalizedEmail),
                eq(user.name, registerDto.username)
            )
        ).limit(1);

        if (existingUser.length > 0) {
            throw new ConflictException('Email or username already exists');
        }

        const passwordHash = await bcrypt.hash(registerDto.password, 10);

        const [newUser] = await db.insert(user).values({
            name: registerDto.username,
            email: normalizedEmail,
            passwordHash: passwordHash,
        }).returning();

        return {
            message: 'User registered successfully',
            user: newUser,
        };
    }
}
