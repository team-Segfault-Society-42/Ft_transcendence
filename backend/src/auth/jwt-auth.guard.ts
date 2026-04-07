import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { Request } from 'express'

interface JwtPayload {
	sub: number
	email: string
}

interface AuthRequest extends Request {
	user:JwtPayload
}

interface AuthSocket extends Socket {
	data: {
		user:JwtPayload
	}
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let token: string | undefined
		let dataContainer: Request | Socket

		if (context.getType() === "http") {

			dataContainer = context.switchToHttp().getRequest();
			token = this.extractTokenFromRequest(dataContainer);
		} 
		else if (context.getType() === "ws") {

			dataContainer = context.switchToWs().getClient()
			token = this.extractTokenFromWs(dataContainer);
		}

		if (!token) {
			throw new UnauthorizedException('Missing authentication token');
		}

		try {
			const payload = await this.jwtService.verifyAsync(token);

			if (context.getType() === "http") {

				(dataContainer as AuthRequest).user = payload;
			}
			else if (context.getType() === 'ws') {

				(dataContainer as AuthSocket).data.user = payload;

			}
			return true;
		} catch {
			throw new UnauthorizedException('Invalid or expired token');
		}
	}

	private extractTokenFromRequest(request: any): string | undefined {
		const cookieToken = request.cookies?.access_token;

		if (cookieToken) {
			return cookieToken;
		}

		return this.extractTokenFromHeader(request);
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const authHeader = request.headers['authorization'];

		if (!authHeader) return undefined;

		const [type, token] = authHeader.split(' ');

		if (type !== 'Bearer') return undefined;

		return token;
	}

	private extractTokenFromWs(client: any): string | undefined {
		const headerToken = this.extractTokenFromHeader(client.handshake)
		if (headerToken)
			return headerToken

		const rawCookies = client.handshake.headers.cookie
		if (!rawCookies)
			return undefined

		const cookies = rawCookies.split(';')
		
		for (const cookie of cookies) {
			const [key, value] = cookie.trim().split('=')

			if (key === 'access_token' && value) {
				return value
			}
		}
		return undefined
	}
}
