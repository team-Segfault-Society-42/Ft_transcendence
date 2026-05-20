import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from '@otplib/v12-adapter';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

const TWO_FACTOR_MAX_FAILED_ATTEMPTS = 5;
const TWO_FACTOR_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;
const TWO_FACTOR_LOCK_MS = 5 * 60 * 1000;

interface TwoFactorAttemptState {
	failedAttempts: number[];
	lockedUntil?: number;
}

export interface TwoFactorPendingPayload {
	sub: number;
	email: string;
	type: '2fa_pending';
}

export interface TwoFactorSetupResult {
	qrCodeDataUrl: string;
}

@Injectable()
export class TwoFactorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	private readonly attemptsByUserId = new Map<number, TwoFactorAttemptState>();

	private assertCanAttempt(userId: number) {
		const now = Date.now();
		const state = this.attemptsByUserId.get(userId);

		if (!state?.lockedUntil) {
			return;
		}

		if (state.lockedUntil > now) {
			throw new UnauthorizedException('ERR_AUTH_2FA_TOO_MANY_ATTEMPTS');
		}

		this.attemptsByUserId.delete(userId);
	}

	private recordFailedAttempt(userId: number) {
		const now = Date.now();
		const state = this.attemptsByUserId.get(userId) ?? {
			failedAttempts: [],
		};

		const recentAttempts = state.failedAttempts.filter(
			(timestamp) => now - timestamp < TWO_FACTOR_ATTEMPT_WINDOW_MS,
		);

		recentAttempts.push(now);

		if (recentAttempts.length >= TWO_FACTOR_MAX_FAILED_ATTEMPTS) {
			this.attemptsByUserId.set(userId, {
				failedAttempts: recentAttempts,
				lockedUntil: now + TWO_FACTOR_LOCK_MS,
			});
			return;
		}

		this.attemptsByUserId.set(userId, {
			failedAttempts: recentAttempts,
		});
	}

	private clearFailedAttempts(userId: number) {
		this.attemptsByUserId.delete(userId);
	}
	async generateSetup(userId: number): Promise<TwoFactorSetupResult> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UnauthorizedException('ERR_USER_NOT_FOUND');
		}

		if (user.isTwoFactorEnabled) {
			throw new BadRequestException('ERR_AUTH_2FA_ALREADY_ENABLED');
		}

		const secret = authenticator.generateSecret();

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				twoFactorTempSecret: secret,
			},
		});

		const appName = 'ft_transcendence';
		const accountName = user.email;
		const otpauthUrl = authenticator.keyuri(accountName, appName, secret);
		const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

		return {
			qrCodeDataUrl,
		};
	}

	async verifySetup(userId: number, code: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UnauthorizedException('ERR_USER_NOT_FOUND');
		}

		if (user.isTwoFactorEnabled) {
			throw new BadRequestException('ERR_AUTH_2FA_ALREADY_ENABLED');
		}

		if (!user.twoFactorTempSecret) {
			throw new BadRequestException('ERR_AUTH_2FA_NO_SETUP');
		}

		this.assertCanAttempt(userId);

		const isCodeValid = this.verifyTotpCode(user.twoFactorTempSecret, code);

		if (!isCodeValid) {
			this.recordFailedAttempt(userId);
			throw new BadRequestException('ERR_AUTH_2FA_INVALID_CODE');
		}

		this.clearFailedAttempts(userId);

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				isTwoFactorEnabled: true,
				twoFactorSecret: user.twoFactorTempSecret,
				twoFactorTempSecret: null,
			},
		});

		return {
			message: 'AUTH_2FA_ENABLED_SUCCESS',
		};
	}


	async createTwoFactorPendingToken(user: { id: number; email: string }) {
		const payload: TwoFactorPendingPayload = {
			sub: user.id,
			email: user.email,
			type: '2fa_pending',
		};

		const token = await this.jwtService.signAsync(payload, {
			expiresIn: '5m',
		});

		return { token };
	}

	async verifyTwoFactorPendingToken(
		token: string,
	): Promise<TwoFactorPendingPayload> {
		const payload =
			await this.jwtService.verifyAsync<TwoFactorPendingPayload>(token);

		if (payload.type !== '2fa_pending') {
			throw new UnauthorizedException('ERR_AUTH_2FA_INVALID_TOKEN');
		}

		return payload;
	}


	async verifyLoginCode(userId: number, code: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UnauthorizedException('ERR_USER_NOT_FOUND');
		}

		if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
			throw new BadRequestException('ERR_AUTH_2FA_NOT_ENABLED');
		}

		this.assertCanAttempt(userId);

		const isCodeValid = this.verifyTotpCode(user.twoFactorSecret, code);

		if (!isCodeValid) {
			this.recordFailedAttempt(userId);
			throw new BadRequestException('ERR_AUTH_2FA_INVALID_CODE');
		}

		this.clearFailedAttempts(userId);
	}

	private verifyTotpCode(secret: string, code: string): boolean {
		// @otplib/v12-adapter authenticator.verify() uses the library default
		// TOTP validation window. We rely on the default to tolerate small
		// clock drift, and keep this documented because it affects 2FA security.
		return authenticator.verify({
			token: code,
			secret,
		});
	}
}
