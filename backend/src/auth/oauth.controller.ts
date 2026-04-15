import {
	BadRequestException,
	Controller,
	Get,
	Query,
	Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from './public.decorator';

@Controller('auth')
export class OAuthController {
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
	handleGoogleCallback(@Query('code') code?: string) {
		if (!code) {
			throw new BadRequestException('Missing OAuth authorization code');
		}

		return {
			message: 'OAuth Google callback reached',
			code,
		};
	}
}
