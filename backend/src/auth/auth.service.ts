import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TwoFactorService } from './twofa.service';

export interface FullAuthLoginResult {
	type: 'full_auth';
	access_token: string;
}

export interface TwoFactorRequiredLoginResult {
	type: '2fa_required';
	two_factor_token: string;
}

export type LoginResult =
	| FullAuthLoginResult
	| TwoFactorRequiredLoginResult;

const privateUserSelect = {
	id: true,
	email: true,
	username: true,
	bio: true,
	avatar: true,
	wins: true,
	losses: true,
	draws: true,
	xp: true,
	passwordHash: true,
	isTwoFactorEnabled: true,
} satisfies Prisma.UserSelect;

type PrivateUser = Prisma.UserGetPayload<{
	select: typeof privateUserSelect;
}>;

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly twoFactorService: TwoFactorService,
	) {}

	/**
	 * @description Maps the authenticated user's database shape to the safe private account shape returned to the frontend.
	 * @param user - User selected with privateUserSelect.
	 * @returns Authenticated user data without password hash or 2FA secrets.
	 * @remarks This method may expose account settings fields, but must never expose passwordHash, twoFactorSecret, or twoFactorTempSecret.
	 */
	private toPrivateUser(user: PrivateUser) {
		return {
			id: user.id,
			email: user.email,
			username: user.username,
			bio: user.bio,
			avatar: user.avatar,
			wins: user.wins,
			losses: user.losses,
			draws: user.draws,
			xp: user.xp,
			isTwoFactorEnabled: user.isTwoFactorEnabled,
			hasPassword: user.passwordHash !== null,
		};
	}

	/**
	 * @description Verifies the current password when the account already has a local password.
	 * @param passwordHash - Stored bcrypt hash, or null for OAuth-only accounts.
	 * @param currentPassword - Password provided by the user for sensitive account changes.
	 * @returns Nothing when verification succeeds or is not required.
	 * @throws UnauthorizedException when a local account omits or fails password confirmation.
	 * @remarks OAuth-only accounts without passwordHash are allowed to set account credentials without a current password.
	 */
	private async verifyCurrentPasswordIfRequired(
		passwordHash: string | null,
		currentPassword: string | undefined,
	): Promise<void> {
		if (!passwordHash) {
			return;
		}

		if (!currentPassword) {
			throw new UnauthorizedException('ERR_AUTH_CURRENT_PWD_REQUIRED');
		}

		const passwordMatches = await bcrypt.compare(
			currentPassword,
			passwordHash,
		);

		if (!passwordMatches) {
			throw new UnauthorizedException('ERR_AUTH_INVALID_CREDENTIALS');
		}
	}

	/**
	 * @description Registers a local user with a hashed password and returns a safe authenticated account shape.
	 * @param registerDto - Validated registration payload.
	 * @returns Private authenticated user data without sensitive security fields.
	 * @throws ConflictException when email or username already exists.
	 */
	async register(registerDto: RegisterDto) {
		const passwordHash = await bcrypt.hash(registerDto.password, 10);

		try {
			const user = await this.prisma.user.create({
				data: {
					email: registerDto.email,
					passwordHash,
					username: registerDto.username,
					bio: registerDto.bio ?? '',
					avatar: '/default.png',
					wins: 0,
					losses: 0,
					draws: 0,
				},
				select: privateUserSelect,
			});

			return this.toPrivateUser(user);
		} catch (error: unknown) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException('ERR_AUTH_ALREADY_EXISTS');
			}

			throw error;
		}
	}

	/**
	 * @description Creates a full authentication JWT for a fully verified user.
	 * @param user - User identity used as JWT payload source.
	 * @returns Signed access token.
	 * @remarks This must only be called after password/OAuth and required 2FA checks are complete.
	 */
	async signTokenForUser(user: { id: number; email: string }): Promise<string> {
		const payload = {
			sub: user.id,
			email: user.email,
		};

		return this.jwtService.signAsync(payload);
	}

	/**
	 * @description Creates either a full login result or a temporary 2FA pending result.
	 * @param user - User account with 2FA state.
	 * @returns Login result consumed by AuthController to set the correct cookie.
	 * @remarks Users with 2FA enabled must receive only a temporary 2fa_pending token until TOTP verification succeeds.
	 */
	async createLoginResultForUser(user: {
		id: number;
		email: string;
		isTwoFactorEnabled: boolean;
	}): Promise<LoginResult> {
		if (user.isTwoFactorEnabled) {
			const { token } = await this.twoFactorService.createTwoFactorPendingToken({
				id: user.id,
				email: user.email,
			});

			return {
				type: '2fa_required',
				two_factor_token: token,
			};
		}

		const accessToken = await this.signTokenForUser(user);

		return {
			type: 'full_auth',
			access_token: accessToken,
		};
	}

	/**
	 * @description Authenticates a local email/password login.
	 * @param loginDto - Validated login payload.
	 * @returns Full auth result or 2FA pending result depending on account settings.
	 * @throws UnauthorizedException when credentials are missing, invalid, or the account has no local password.
	 */
	async login(loginDto: LoginDto): Promise<LoginResult> {
		const user = await this.prisma.user.findUnique({
			where: { email: loginDto.email },
		});

		if (!user || !user.passwordHash) {
			throw new UnauthorizedException('ERR_AUTH_INVALID_CREDENTIALS');
		}

		const passwordMatches = await bcrypt.compare(
			loginDto.password,
			user.passwordHash,
		);

		if (!passwordMatches) {
			throw new UnauthorizedException('ERR_AUTH_INVALID_CREDENTIALS');
		}

		return this.createLoginResultForUser(user);
	}

	/**
	 * @description Returns the current authenticated user's private account view.
	 * @param userId - Authenticated user ID from the access_token payload.
	 * @returns Safe private user shape for account/profile/settings UI.
	 * @throws NotFoundException when the JWT references a deleted user.
	 */
	async me(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: privateUserSelect,
		});

		if (!user) {
			throw new NotFoundException('ERR_USER_NOT_FOUND');
		}

		return this.toPrivateUser(user);
	}

	/**
	 * @description Updates the authenticated user's password after verifying ownership when required.
	 * @param userId - Authenticated user ID from the access_token payload.
	 * @param currentPassword - Current password, required for local-password accounts.
	 * @param newPassword - New password validated by UpdatePasswordDto.
	 * @returns Frontend translation message key.
	 * @throws NotFoundException when the authenticated user no longer exists.
	 * @throws UnauthorizedException when password confirmation is required and invalid.
	 */
	async updatePassword(
		userId: number,
		currentPassword: string | undefined,
		newPassword: string,
	) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				passwordHash: true,
			},
		});

		if (!user) {
			throw new NotFoundException('ERR_USER_NOT_FOUND');
		}

		await this.verifyCurrentPasswordIfRequired(
			user.passwordHash,
			currentPassword,
		);

		const passwordHash = await bcrypt.hash(newPassword, 10);

		await this.prisma.user.update({
			where: { id: userId },
			data: { passwordHash },
		});

		return {
			message: 'AUTH_PASSWORD_UPDATED_SUCCESS',
		};
	}

	/**
	 * @description Updates the authenticated user's email after verifying ownership when required.
	 * @param userId - Authenticated user ID from the access_token payload.
	 * @param currentPassword - Current password, required for local-password accounts.
	 * @param newEmail - New email address validated by UpdateEmailDto.
	 * @returns Frontend translation message key.
	 * @throws NotFoundException when the authenticated user no longer exists.
	 * @throws UnauthorizedException when password confirmation is required and invalid.
	 * @throws ConflictException when the email is already used by another account.
	 * @remarks This method must stay on the authenticated account flow and must not trust a userId from the frontend body.
	 */
	async updateEmail(
		userId: number,
		currentPassword: string | undefined,
		newEmail: string,
	) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				passwordHash: true,
			},
		});

		if (!user) {
			throw new NotFoundException('ERR_USER_NOT_FOUND');
		}

		await this.verifyCurrentPasswordIfRequired(
			user.passwordHash,
			currentPassword,
		);

		try {
			await this.prisma.user.update({
				where: { id: userId },
				data: { email: newEmail },
			});
		} catch (error: unknown) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException('ERR_AUTH_EMAIL_ALREADY_EXISTS');
			}

			throw error;
		}

		return {
			message: 'AUTH_EMAIL_UPDATED_SUCCESS',
		};
	}
}
