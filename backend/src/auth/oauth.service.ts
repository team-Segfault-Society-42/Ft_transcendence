import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface OAuthProfile {
	provider: 'google';
	providerUserId: string;
	email: string;
	displayName: string;
	avatarUrl: string;
}

@Injectable()
export class OAuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly httpService: HttpService,
	) {}

	async handleGoogleCallback(code: string) {
		const clientId = process.env.GOOGLE_CLIENT_ID;
		const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

		if (!clientId || !clientSecret) {
			throw new InternalServerErrorException(
				'Google OAuth is not configured on the backend',
			);
		}
		const tokenResponse = await firstValueFrom(
			this.httpService.post(
				'https://oauth2.googleapis.com/token',
				new URLSearchParams({
					code,
					client_id: clientId,
					client_secret: clientSecret,
					redirect_uri: 'http://localhost:1024/api/auth/google/callback',
					grant_type: 'authorization_code',
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			),
		);

		console.log('GOOGLE TOKEN RESPONSE:', tokenResponse.data);

		const profile: OAuthProfile = {
			provider: 'google',
			providerUserId: `google-${code}`,
			email: 'google-user@example.com',
			displayName: 'Google Test User',
			avatarUrl: 'https://example.com/avatar.png',
		};

		const existingOAuthAccount = await this.prisma.oAuthAccount.findUnique({
			where: {
				provider_providerUserId: {
					provider: profile.provider,
					providerUserId: profile.providerUserId,
				},
			},
			include: {
				user: true,
			},
		});

		if (existingOAuthAccount) {
			const user = existingOAuthAccount.user;

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
			};
		}

		const baseUsername = profile.displayName.toLowerCase().replace(/\s+/g, '_');
		const username = `${baseUsername}_${Date.now()}`;

		const user = await this.prisma.user.create({
			data: {
				email: profile.email,
				passwordHash: null,
				username,
				bio: '',
				avatar: profile.avatarUrl,
				wins: 0,
				losses: 0,
				draws: 0,
				xp: 0,
				oauthAccounts: {
					create: {
						provider: profile.provider,
						providerUserId: profile.providerUserId,
					},
				},
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
			xp: user.xp,
		};
	}
}
