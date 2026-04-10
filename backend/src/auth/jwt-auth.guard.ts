import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();

		const token = this.extractTokenFromRequest(request);

		if (!token) {
			throw new UnauthorizedException('Missing authentication token');
		}

		try {
			const payload = await this.jwtService.verifyAsync(token);

			request.user = payload;

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
}
