import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly twoFactorService: TwoFactorService,
	) {}

	private toPrivateUser(user: any) {
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
				avatar: registerDto.avatar ?? '/default.png',
				wins: 0,
				losses: 0,
				draws: 0,
			},
		});

		return this.toPrivateUser(user);
		} catch (error: unknown) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'code' in error &&
				error.code === 'P2002'
				) {
			throw new ConflictException('Email or username already exists');
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
			throw new UnauthorizedException('Invalid credentials');
		}

		const passwordMatches = await bcrypt.compare(
			loginDto.password,
			user.passwordHash,
		);

		if (!passwordMatches) {
			throw new UnauthorizedException('Invalid credentials');
		}

		return this.createLoginResultForUser(user);
	}

	async me(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			});

		if (!user) {
			throw new NotFoundException('User not found');
			}

		return this.toPrivateUser(user);
	}
}
