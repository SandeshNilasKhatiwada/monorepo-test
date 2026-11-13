import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
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
