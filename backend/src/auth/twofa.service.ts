import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from '@otplib/v12-adapter';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

export interface TwoFactorPendingPayload {
	sub: number;
	email: string;
	type: '2fa_pending';
}

export interface TwoFactorSetupResult {
	otpauthUrl: string;
	qrCodeDataUrl: string;
}

@Injectable()
export class TwoFactorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async generateSetup(userId: number): Promise<TwoFactorSetupResult> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		if (user.isTwoFactorEnabled) {
			throw new BadRequestException('Two-factor authentication is already enabled');
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
			otpauthUrl,
			qrCodeDataUrl,
		};
	}

	async verifySetup(userId: number, code: string) {
		void userId;
		void code;
		throw new Error('Method not implemented.');
	}

	async createTwoFactorPendingToken(user: { id: number; email: string }) {
		void user;
		throw new Error('Method not implemented.');
	}

	async verifyTwoFactorPendingToken(
		token: string,
	): Promise<TwoFactorPendingPayload> {
		void token;
		throw new Error('Method not implemented.');
	}

	async verifyLoginCode(userId: number, code: string) {
		void userId;
		void code;
		throw new Error('Method not implemented.');
	}

	private verifyTotpCode(secret: string, code: string): boolean {
		void secret;
		void code;
		throw new Error('Method not implemented.');
	}
}
