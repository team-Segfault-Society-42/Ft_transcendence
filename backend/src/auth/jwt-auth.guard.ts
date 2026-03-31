import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
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
