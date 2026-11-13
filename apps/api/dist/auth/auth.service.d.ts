import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthService {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    private hashPassword;
    private issueToken;
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            createdAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            username: string;
            email: string;
            createdAt: Date;
        };
    }>;
    refreshToken(rawRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getUserById(userId: string): Promise<{
        id: string;
        username: string;
        email: string;
        createdAt: Date;
    }>;
}
