import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

export interface OAuthProfile {
	provider: '42';
	providerUserId: string;
	email: string;
	displayName: string;
	providerUsername?: string;
	avatarUrl: string;
}

interface OAuthAuthenticatedUser {
	id: number;
	email: string;
	username: string;
	bio: string | null;
	avatar: string;
	wins: number;
	losses: number;
	draws: number;
	xp: number;
	isTwoFactorEnabled: boolean;
}

interface FortyTwoTokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope?: string;
	created_at?: number;
}

interface FortyTwoUserInfoResponse {
	id: number;
	email: string;
	login: string;
	displayname: string;
	image?: {
		link?: string;
		versions?: {
			medium?: string;
			small?: string;
			micro?: string;
		};
	};
}

const oauthUserSelect = {
	id: true,
	email: true,
	username: true,
	bio: true,
	avatar: true,
	wins: true,
	losses: true,
	draws: true,
	xp: true,
	isTwoFactorEnabled: true,
} satisfies Prisma.UserSelect;

type OAuthUser = Prisma.UserGetPayload<{
	select: typeof oauthUserSelect;
}>;

@Injectable()
export class OAuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly httpService: HttpService,
	) {}

	/**
	 * @description Normalizes an external provider username into the local username format.
	 * @param value - Username or display name received from the OAuth provider.
	 * @returns Lowercase username containing only letters, numbers, and underscores.
	 */
	private normalizeUsername(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9_]/g, '_')
			.replace(/_+/g, '_')
			.replace(/^_+|_+$/g, '');
	}

	/**
	 * @description Generates a unique local username from an OAuth provider username.
	 * @param baseUsername - Preferred username from the OAuth provider.
	 * @returns Available local username.
	 * @remarks 42 login is preferred over display name because it is shorter and more stable.
	 */
	private async generateUniqueUsername(baseUsername: string): Promise<string> {
		const cleanBaseUsername = this.normalizeUsername(baseUsername) || 'user';

		let candidate = cleanBaseUsername;
		let suffix = 1;

		while (await this.prisma.user.findUnique({ where: { username: candidate } })) {
			candidate = `${cleanBaseUsername}_${suffix}`;
			suffix++;
		}

		return candidate;
	}

	/**
	 * @description Maps a selected OAuth user to the safe auth shape consumed by AuthService.
	 * @param user - User selected with oauthUserSelect.
	 * @returns Safe user data required to create login results.
	 * @remarks This must not include passwordHash, 2FA secrets, or OAuth tokens.
	 */
	private toOAuthAuthenticatedUser(user: OAuthUser): OAuthAuthenticatedUser {
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

	/**
	 * @description Finds an existing OAuth-linked user, links by email when safe, or creates a new local user.
	 * @param profile - Normalized profile returned by the OAuth provider.
	 * @returns Safe user data required by AuthService to create a session or 2FA pending login.
	 * @remarks Provider tokens are never stored or returned. Existing email accounts are linked instead of duplicated.
	 */
	private async findOrCreateUserFromOAuthProfile(
		profile: OAuthProfile,
	): Promise<OAuthAuthenticatedUser> {
		const existingOAuthAccount = await this.prisma.oAuthAccount.findUnique({
			where: {
				provider_providerUserId: {
					provider: profile.provider,
					providerUserId: profile.providerUserId,
				},
			},
			select: {
				user: {
					select: oauthUserSelect,
				},
			},
		});

		if (existingOAuthAccount) {
			return this.toOAuthAuthenticatedUser(existingOAuthAccount.user);
		}

		const existingUserByEmail = await this.prisma.user.findUnique({
			where: {
				email: profile.email,
			},
			select: oauthUserSelect,
		});

		if (existingUserByEmail) {
			await this.prisma.oAuthAccount.create({
				data: {
					provider: profile.provider,
					providerUserId: profile.providerUserId,
					userId: existingUserByEmail.id,
				},
			});

			return this.toOAuthAuthenticatedUser(existingUserByEmail);
		}

		const baseUsername = profile.providerUsername ?? profile.displayName;
		const username = await this.generateUniqueUsername(baseUsername);

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
			select: oauthUserSelect,
		});

		return this.toOAuthAuthenticatedUser(user);
	}

	/**
	 * @description Exchanges a 42 OAuth code for a 42 profile, then finds or creates the local user.
	 * @param code - Authorization code returned by 42.
	 * @returns Safe user data required by AuthService to create a session or 2FA pending login.
	 * @throws InternalServerErrorException when required 42 OAuth environment variables are missing.
	 * @remarks OAuth access tokens stay server-side and are not stored in the database.
	 */
	async handleFortyTwoCallback(code: string): Promise<OAuthAuthenticatedUser> {
		const clientId = process.env.FORTYTWO_CLIENT_ID;
		const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
		const redirectUri = process.env.FORTYTWO_REDIRECT_URI;

		if (!clientId || !clientSecret || !redirectUri) {
			throw new InternalServerErrorException('ERR_OAUTH_42_CONFIG');
		}

		const tokenResponse = await firstValueFrom(
			this.httpService.post<FortyTwoTokenResponse>(
				'https://api.intra.42.fr/oauth/token',
				new URLSearchParams({
					grant_type: 'authorization_code',
					client_id: clientId,
					client_secret: clientSecret,
					code,
					redirect_uri: redirectUri,
				}),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			),
		);

		const accessToken = tokenResponse.data.access_token;

		const userInfoResponse = await firstValueFrom(
			this.httpService.get<FortyTwoUserInfoResponse>(
				'https://api.intra.42.fr/v2/me',
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			),
		);

		const fortyTwoUser = userInfoResponse.data;

		const profile: OAuthProfile = {
			provider: '42',
			providerUserId: String(fortyTwoUser.id),
			email: fortyTwoUser.email,
			displayName: fortyTwoUser.displayname,
			providerUsername: fortyTwoUser.login,
			avatarUrl:
				fortyTwoUser.image?.versions?.medium ??
				fortyTwoUser.image?.link ??
				'default.png',
		};

		return this.findOrCreateUserFromOAuthProfile(profile);
	}
}
