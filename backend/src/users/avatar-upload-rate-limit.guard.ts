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

	/**
	 * @description Applies a per-user avatar upload rate limit.
	 * @param context - NestJS execution context.
	 * @returns True when the upload is allowed.
	 * @throws HttpException when the upload rate limit is exceeded.
	 * @remarks The authenticated JWT user ID is used instead of IP-based tracking.
	 */
	canActivate(context: ExecutionContext): boolean {
		const request =
			context.switchToHttp().getRequest<AuthRequest>();

		const userId = request.user.sub;

		const now = Date.now();

		const previousAttempts =
			this.attemptsByUserId.get(userId) ?? [];

		const recentAttempts = previousAttempts.filter(
			(timestamp) =>
				now - timestamp <
				AVATAR_UPLOAD_RATE_LIMIT_WINDOW_MS,
		);

		if (
			recentAttempts.length >=
			AVATAR_UPLOAD_RATE_LIMIT_MAX_REQUESTS
		) {
			throw new HttpException(
				'ERR_USER_AVATAR_RATE_LIMIT',
				HttpStatus.TOO_MANY_REQUESTS,
			);
		}

		recentAttempts.push(now);

		this.attemptsByUserId.set(userId, recentAttempts);

		return true;
	}
}
