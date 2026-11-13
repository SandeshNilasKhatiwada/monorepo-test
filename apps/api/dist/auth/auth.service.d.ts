import { RegisterDto } from './dto/register.dto.js';
export declare class AuthService {
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
