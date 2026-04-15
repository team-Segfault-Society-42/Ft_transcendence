import { Injectable } from '@nestjs/common';

export interface OAuthProfile {
	provider: 'google';
	providerUserId: string;
	email: string;
	displayName: string;
	avatarUrl: string;
}

@Injectable()
export class OAuthService {
	async handleGoogleCallback(code: string): Promise<OAuthProfile> {
		return {
			provider: 'google',
			providerUserId: `google-${code}`,
			email: 'google-user@example.com',
			displayName: 'Google Test User',
			avatarUrl: 'https://example.com/avatar.png',
		};
	}
}
