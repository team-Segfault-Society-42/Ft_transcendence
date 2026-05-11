import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
} from '@nestjs/common';
import type { AuthRequest } from '../auth/jwt-auth.guard';
import {
	AVATAR_UPLOAD_RATE_LIMIT_MAX_REQUESTS,
	AVATAR_UPLOAD_RATE_LIMIT_WINDOW_MS,
} from './avatar.constants';

@Injectable()
export class AvatarUploadRateLimitGuard implements CanActivate {
	private readonly attemptsByUserId = new Map<number, number[]>();

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<AuthRequest>();
		const userId = request.user.sub;
		const now = Date.now();

		const previousAttempts = this.attemptsByUserId.get(userId) ?? [];

		const recentAttempts = previousAttempts.filter(
			(timestamp) => now - timestamp < AVATAR_UPLOAD_RATE_LIMIT_WINDOW_MS,
		);

		if (recentAttempts.length >= AVATAR_UPLOAD_RATE_LIMIT_MAX_REQUESTS) {
			throw new HttpException(
				'Too many avatar upload attempts. Please try again later.',
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}

		recentAttempts.push(now);
		this.attemptsByUserId.set(userId, recentAttempts);

		return true;
	}
}
