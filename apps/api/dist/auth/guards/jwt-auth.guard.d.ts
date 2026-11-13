import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
export interface AuthenticatedUser {
    id: string;
    sub?: string;
    [key: string]: any;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly configService;
    constructor(jwtService: JwtService, configService: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
