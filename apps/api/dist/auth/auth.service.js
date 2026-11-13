var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { user } from '../db/schema.js';
let AuthService = class AuthService {
    async register(registerDto) {
        const normalizedEmail = registerDto.email.toLowerCase();
        const existingUser = await db.select().from(user).where(or(eq(user.email, normalizedEmail), eq(user.name, registerDto.username))).limit(1);
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
};
AuthService = __decorate([
    Injectable()
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map