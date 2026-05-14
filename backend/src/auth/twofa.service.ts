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
			otpauthUrl,
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

		const isCodeValid = this.verifyTotpCode(user.twoFactorTempSecret, code);

		if (!isCodeValid) {
			throw new BadRequestException('ERR_AUTH_2FA_INVALID_CODE');
		}

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

		const isCodeValid = this.verifyTotpCode(user.twoFactorSecret, code);

		if (!isCodeValid) {
			throw new BadRequestException('ERR_AUTH_2FA_INVALID_CODE');
		}
	}

	private verifyTotpCode(secret: string, code: string): boolean {
		return authenticator.verify({
			token: code,
			secret,
		});
	}
}
