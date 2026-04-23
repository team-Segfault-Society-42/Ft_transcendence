import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface TwoFactorPendingPayload {
	sub: number;
	email: string;
	type: '2fa_pending';
}

@Injectable()
export class TwoFactorService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwtService: JwtService,
	) {}

	async generateSetup(userId: number) {
		void userId;
		throw new Error('Method not implemented.');
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
