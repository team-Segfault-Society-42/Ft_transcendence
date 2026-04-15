import {
	BadRequestException,
	Controller,
	Get,
	Query,
	Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from './public.decorator';
import { OAuthService } from './oauth.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class OAuthController {
	constructor(
		private readonly oauthService: OAuthService,
		private readonly authService: AuthService,
	) {}

	@Public()
	@Get('google')
	startGoogleOAuth(@Res() res: Response) {
		const params = new URLSearchParams({
			client_id: process.env.GOOGLE_CLIENT_ID ?? '',
			redirect_uri: 'http://localhost:1024/api/auth/google/callback',
			response_type: 'code',
			scope: 'openid email profile',
		});

		const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

		return res.redirect(authorizationUrl);
	}

	@Public()
	@Get('google/callback')
	async handleGoogleCallback(
		@Query('code') code?: string,
		@Res({ passthrough: true }) res?: Response,
	) {
		if (!code) {
			throw new BadRequestException('Missing OAuth authorization code');
		}

		const user = await this.oauthService.handleGoogleCallback(code);
		const accessToken = await this.authService.signTokenForUser(user);

		res?.cookie('access_token', accessToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 1000,
		});

		return {
			message: 'OAuth login successful',
			user,
		};
	}
}
