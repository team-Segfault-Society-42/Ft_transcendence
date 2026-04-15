import { Injectable } from '@nestjs/common';

@Injectable()
export class OAuthService {
	async handleGoogleCallback(code: string) {
		return {
			message: 'OAuth Google callback handled by service',
			code,
		};
	}
}
