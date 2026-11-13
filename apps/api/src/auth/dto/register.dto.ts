// apps/api/src/auth/dto/register.dto.ts 
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
export class RegisterDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email!: string;
    @IsString() @MinLength(3, { message: 'Username must be at least 3 characters long' }) @Matches(/^[a-zA-Z0-9\_]+$/, { message: 'Username can only contain letters, numbers, and underscores', })
    username!: string;
    @IsString() @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password!: string;
}