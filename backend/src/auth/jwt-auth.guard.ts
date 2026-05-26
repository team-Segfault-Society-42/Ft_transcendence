import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { DefaultEventsMap, Socket } from 'socket.io';
import { IS_PUBLIC_KEY } from './public.decorator';
import { extractAccessTokenFromCookie } from './utils/extract-access-token-from-cookie';

export interface JwtPayload {
	sub: number;
	email: string;
}

export interface AuthRequest extends Request {
	user: JwtPayload;
}

export interface AuthSocketData {
	user: JwtPayload;
	currentGameId?: string;
}

/**
 * Authenticated Socket.IO client type.
 *
 * @remarks The generic parameters represent:
 * events received from the client, events sent to the client,
 * server-side events, and socket.data.
 */
export type AuthSocket = Socket<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	AuthSocketData
>;

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	/**
	 * @description Validates access_token cookies for protected HTTP routes and WebSocket gateways.
	 * @param context - Nest execution context for HTTP or WebSocket requests.
	 * @returns True when access is public or the access_token is valid.
	 * @throws UnauthorizedException when a protected HTTP route has no valid access_token.
	 * @remarks WebSocket auth failures return false instead of throwing so the gateway can reject the connection cleanly.
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const contextType = context.getType<'http' | 'ws'>();
		const token = this.extractTokenFromContext(context, contextType);

		if (!token) {
			if (contextType === 'ws') {
				return false;
			}

			throw new UnauthorizedException('ERR_AUTH_MISSING_TOKEN');
		}

		try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

			this.attachUserToContext(context, contextType, payload);

			return true;
		} catch {
			if (contextType === 'ws') {
				return false;
			}

			throw new UnauthorizedException('ERR_AUTH_INVALID_TOKEN');
		}
	}

	/**
	 * @description Extracts the access token from either an HTTP request or a WebSocket handshake.
	 * @param context - Nest execution context.
	 * @param contextType - Current transport type.
	 * @returns access_token value when present.
	 */
	private extractTokenFromContext(
		context: ExecutionContext,
		contextType: 'http' | 'ws',
	): string | undefined {
		if (contextType === 'http') {
			const request = context.switchToHttp().getRequest<AuthRequest>();
			return this.extractTokenFromHttpRequest(request);
		}

		if (contextType === 'ws') {
			const client = context.switchToWs().getClient<AuthSocket>();
			return this.extractTokenFromWs(client);
		}

		return undefined;
	}

	/**
	 * @description Stores the verified JWT payload on the request or socket data.
	 * @param context - Nest execution context.
	 * @param contextType - Current transport type.
	 * @param payload - Verified JWT payload.
	 * @returns Nothing.
	 */
	private attachUserToContext(
		context: ExecutionContext,
		contextType: 'http' | 'ws',
		payload: JwtPayload,
	): void {
		if (contextType === 'http') {
			const request = context.switchToHttp().getRequest<AuthRequest>();
			request.user = payload;
			return;
		}

		if (contextType === 'ws') {
			const client = context.switchToWs().getClient<AuthSocket>();
			client.data.user = payload;
		}
	}

	private extractTokenFromHttpRequest(request: Request): string | undefined {
		return request.cookies?.access_token;
	}

	private extractTokenFromWs(client: AuthSocket): string | undefined {
		return extractAccessTokenFromCookie(client.handshake.headers.cookie);
	}
}
