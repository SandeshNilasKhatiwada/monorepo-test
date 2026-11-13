import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface AuthenticatedUser {
    id: string;
    sub?: string;
    [key: string]: any;
}
export interface AuthenticatedRequest extends Request { user?: AuthenticatedUser; }
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const token = authHeader.split(' ')[1];

        try {
            const accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')!;
            const payload = await this.jwtService.verifyAsync(token, { secret: accessSecret });
            request['user'] = { id: payload.sub, ...payload };
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}