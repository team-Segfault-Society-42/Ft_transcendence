import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	constructor(private readonly prisma: PrismaService) {}

	async register(registerDto: RegisterDto) {
		const passwordHash = await bcrypt.hash(registerDto.password, 10);

		try {
			const user = await this.prisma.user.create({
				data: {
					email: registerDto.email,
					passwordHash,
					username: registerDto.username,
					bio: registerDto.bio ?? '',
					avatar: registerDto.avatar ?? 'default.png',
					wins: 0,
					losses: 0,
					draws: 0,
				},
			});

			return {
				id: user.id,
				email: user.email,
				username: user.username,
				bio: user.bio,
				avatar: user.avatar,
				wins: user.wins,
				losses: user.losses,
				draws: user.draws,
			};
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

	login(loginDto: LoginDto) {
		return {message: 'login endpoint reached' };
	}
}
