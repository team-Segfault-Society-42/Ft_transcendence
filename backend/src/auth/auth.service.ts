import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
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
	// Exposed isTwoFactorEnabled intentionally for authenticated account/settings UI.
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
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				error.code === 'P2002'
				) {
			throw new ConflictException('ERR_AUTH_ALREADY_EXISTS');
			}

			throw error;
		}
	}

	async signTokenForUser(user: { id: number; email: string }) {
		const payload = {
			sub: user.id,
			email: user.email,
		};

		return this.jwtService.signAsync(payload);
	}

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

		if (user.passwordHash) {
			if (!currentPassword) {
				throw new UnauthorizedException('ERR_AUTH_CURRENT_PWD_REQUIRED');
			}

			const passwordMatches = await bcrypt.compare(
				currentPassword,
				user.passwordHash,
			);

			if (!passwordMatches) {
				throw new UnauthorizedException('ERR_AUTH_INVALID_CREDENTIALS');
			}
		}

		const passwordHash = await bcrypt.hash(newPassword, 10);

		await this.prisma.user.update({
			where: { id: userId },
			data: { passwordHash },
		});

		return {
			message: 'AUTH_PASSWORD_UPDATED_SUCCESS',
		};
	}

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

		if (user.passwordHash) {
			if (!currentPassword) {
				throw new UnauthorizedException('ERR_AUTH_CURRENT_PWD_REQUIRED');
			}

			const passwordMatches = await bcrypt.compare(
				currentPassword,
				user.passwordHash,
			);

			if (!passwordMatches) {
				throw new UnauthorizedException('ERR_AUTH_INVALID_CREDENTIALS');
			}
		}

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
