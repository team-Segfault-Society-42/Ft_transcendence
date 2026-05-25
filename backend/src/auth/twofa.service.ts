import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { authenticator } from '@otplib/v12-adapter';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

const TWO_FACTOR_MAX_FAILED_ATTEMPTS = 5;
const TWO_FACTOR_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;
const TWO_FACTOR_LOCK_MS = 5 * 60 * 1000;

const twoFactorUserSelect = {
	id: true,
	email: true,
	isTwoFactorEnabled: true,
	twoFactorSecret: true,
	twoFactorTempSecret: true,
} satisfies Prisma.UserSelect;

type TwoFactorUser = Prisma.UserGetPayload<{
	select: typeof twoFactorUserSelect;
}>;

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
	private readonly attemptsByUserId = new Map<number, TwoFactorAttemptState>();

	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	/**
	 * @description Loads the user fields needed for 2FA operations only.
	 * @param userId - Authenticated user ID or pending-login user ID.
	 * @returns User fields required for 2FA setup, verification, login, or disable flows.
	 * @throws UnauthorizedException when the user does not exist.
	 * @remarks This avoids loading unrelated private user fields such as passwordHash.
	 */
	private async getTwoFactorUser(userId: number): Promise<TwoFactorUser> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: twoFactorUserSelect,
		});

		if (!user) {
			throw new UnauthorizedException('ERR_USER_NOT_FOUND');
		}

		return user;
	}

	/**
	 * @description Blocks 2FA verification when too many recent failed attempts were recorded.
	 * @param userId - User ID whose 2FA attempt state is checked.
	 * @returns Nothing when another attempt is currently allowed.
	 * @throws UnauthorizedException when the user is temporarily locked.
	 */
	private assertCanAttempt(userId: number): void {
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

	/**
	 * @description Records a failed TOTP attempt and locks the user temporarily after repeated failures.
	 * @param userId - User ID whose failed 2FA attempt should be recorded.
	 * @returns Nothing.
	 * @remarks This is an in-memory protection. It resets when the backend process restarts.
	 */
	private recordFailedAttempt(userId: number): void {
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

	/**
	 * @description Clears failed 2FA attempts after a successful verification.
	 * @param userId - User ID whose failed attempt history should be cleared.
	 * @returns Nothing.
	 */
	private clearFailedAttempts(userId: number): void {
		this.attemptsByUserId.delete(userId);
	}

	/**
	 * @description Verifies a TOTP code against a stored secret.
	 * @param secret - TOTP secret stored for setup or enabled 2FA.
	 * @param code - 6-digit TOTP code provided by the user.
	 * @returns True when the code is valid.
	 * @remarks The otplib adapter uses its default validation window, which may tolerate small clock drift.
	 */
	private verifyTotpCode(secret: string, code: string): boolean {
		return authenticator.verify({
			token: code,
			secret,
		});
	}

	/**
	 * @description Generates a temporary TOTP secret and QR code for 2FA setup.
	 * @param userId - Authenticated user ID from the access_token payload.
	 * @returns QR code data URL used by the frontend to display the authenticator setup.
	 * @throws BadRequestException when 2FA is already enabled.
	 * @remarks The raw otpauth URL and secret are not returned. Only the QR code data URL is sent to the frontend.
	 */
	async generateSetup(userId: number): Promise<TwoFactorSetupResult> {
		const user = await this.getTwoFactorUser(userId);

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

	/**
	 * @description Verifies the setup TOTP code and permanently enables 2FA.
	 * @param userId - Authenticated user ID from the access_token payload.
	 * @param code - 6-digit TOTP code validated by TwoFactorCodeDto.
	 * @returns Frontend translation message key.
	 * @throws BadRequestException when setup is missing, already enabled, or code is invalid.
	 */
	async verifySetup(userId: number, code: string) {
		const user = await this.getTwoFactorUser(userId);

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

	/**
	 * @description Creates a short-lived JWT representing partial authentication during 2FA login.
	 * @param user - User identity that passed email/password or OAuth authentication.
	 * @returns Temporary 2FA pending token.
	 * @remarks This token must not be accepted by routes that require full authentication.
	 */
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

	/**
	 * @description Verifies that a token is a valid 2FA pending token.
	 * @param token - JWT from the 2fa_pending HttpOnly cookie.
	 * @returns Decoded 2FA pending payload.
	 * @throws UnauthorizedException when the token is invalid or not a 2FA pending token.
	 */
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

	/**
	 * @description Verifies the TOTP code required to complete a pending 2FA login.
	 * @param userId - User ID from the verified 2fa_pending token.
	 * @param code - 6-digit TOTP code validated by TwoFactorCodeDto.
	 * @returns Nothing when the code is valid.
	 * @throws BadRequestException when 2FA is not enabled or the code is invalid.
	 */
	async verifyLoginCode(userId: number, code: string): Promise<void> {
		const user = await this.getTwoFactorUser(userId);

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

	/**
	 * @description Disables 2FA after verifying the current TOTP code.
	 * @param userId - Authenticated user ID from the access_token payload.
	 * @param code - 6-digit TOTP code validated by DisableTwoFactorDto.
	 * @returns Frontend translation message key.
	 * @throws BadRequestException when 2FA is not enabled or the code is invalid.
	 * @remarks This clears both permanent and temporary 2FA secrets.
	 */
	async disableTwoFactor(userId: number, code: string) {
		const user = await this.getTwoFactorUser(userId);

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

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				isTwoFactorEnabled: false,
				twoFactorSecret: null,
				twoFactorTempSecret: null,
			},
		});

		return {
			message: 'AUTH_2FA_DISABLED_SUCCESS',
		};
	}
}
