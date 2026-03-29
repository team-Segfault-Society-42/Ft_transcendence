import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt' ;

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException('Missing or invalid Authorization header');
		}

		try {
			const payload = await this.jwtService.verifyAsync(token);

			request.user = payload;

			return true;
		} catch {
			throw new UnauthorizedException('Invalid or expired token');
		}
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const authHeader = request.headers['authorization'];

		if (!authHeader) return undefined;

		const [type, token] = authHeader.split(' ');

		if (type !== 'Bearer') return undefined;

		return token;
	}
}
