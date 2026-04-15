import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Socket } from 'socket.io';
import { IS_PUBLIC_KEY } from './public.decorator';

export interface JwtPayload {
	sub: number;
	email: string;
}

export interface AuthRequest extends Request {
	user: JwtPayload;
}

export type AuthSocket = Socket & {
	data: {
		user: JwtPayload;
	};
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const contextType = context.getType<'http' | 'ws'>();
		let token: string | undefined;

		if (contextType === 'http') {
			const request = context.switchToHttp().getRequest<AuthRequest>();
			token = this.extractTokenFromHttpRequest(request);
		} else if (contextType === 'ws') {
			const client = context.switchToWs().getClient<AuthSocket>();
			token = this.extractTokenFromWs(client);
		}

		if (!token) {
			if (contextType === 'ws') return false;
			throw new UnauthorizedException('Missing authentication token');
		}

		try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

			if (contextType === 'http') {
				const request = context.switchToHttp().getRequest<AuthRequest>();
				request.user = payload;
			} else if (contextType === 'ws') {
				const client = context.switchToWs().getClient<AuthSocket>();
				client.data.user = payload;
			}

			return true;
		} catch {
			if (contextType === 'ws') return false;
			throw new UnauthorizedException('Invalid or expired token');
		}
	}

	private extractTokenFromHttpRequest(request: Request): string | undefined {
		return request.cookies?.access_token;
	}

	private extractTokenFromWs(client: AuthSocket): string | undefined {
		const rawCookies = client.handshake.headers.cookie;

		if (!rawCookies) {
			return undefined;
		}

		for (const cookie of rawCookies.split(';')) {
			const [key, ...valueParts] = cookie.trim().split('=');
			const value = valueParts.join('=');

			if (key === 'access_token' && value) {
				return decodeURIComponent(value);
			}
		}

		return undefined;
	}
}
