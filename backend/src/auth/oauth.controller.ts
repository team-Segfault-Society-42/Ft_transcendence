import {
	BadRequestException,
	Controller,
	Get,
	InternalServerErrorException,
	Query,
	Req,
	Res,
	UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from './public.decorator';
import { OAuthService } from './oauth.service';
import { AuthService } from './auth.service';
import { URLSearchParams } from 'node:url';

@Controller('auth')
export class OAuthController {
	constructor(
		private readonly oauthService: OAuthService,
		private readonly authService: AuthService,
	) {}

	@Public()
	@Get('42')
	startFortyTwoOAuth(@Res() res: Response) {
		const clientId = process.env.FORTYTWO_CLIENT_ID;
		const redirectUri = process.env.FORTYTWO_REDIRECT_URI;

		if (!clientId || !redirectUri) {
			throw new InternalServerErrorException(
				'42 OAuth is not configured on the backend',
			);
		}

		// 1. generate state
		const state = Math.random().toString(36).substring(2);

		// 2.store in cookie
		res.cookie('oauth_state', state, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			maxAge: 5 * 60 * 1000, // 5 minutes
		});

		// 3. build authorization URL
		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			response_type: 'code',
			scope: 'public',
			state,
		});

		const authorizationUrl = `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;

		// 4. redirect
		return res.redirect(authorizationUrl);
	}

	@Public()
	@Get('42/callback')
	handleFortyTwoCallback(
		@Query('code') code?: string,
		@Query('state') state?: string,
		@Req() req?: Request,
	) {
		if (!code) {
			throw new BadRequestException('Missing OAuth authorization code');
		}

		if (!state) {
			throw new BadRequestException('Missing OAuth state');
		}

		const storedState = req?.cookies?.oauth_state;

		if(!storedState) {
			throw new UnauthorizedException('Missing stored OAuth state');
		}

		if(state !== storedState) {
			throw new UnauthorizedException('Invalid OAuth state');
		}

		return {
			message: 'OAuth 42 callback state validated',
			code,
			state,
		};
	}
////////////////////Google OAuth//////////////////
	@Public()
	@Get('google')
	startGoogleOAuth(@Res() res: Response) {
		const clientId = process.env.GOOGLE_CLIENT_ID;
		const redirectUri = process.env.GOOGLE_REDIRECT_URI;

		if (!clientId || !redirectUri) {
			throw new InternalServerErrorException(
				'Google OAuth is not configured on the backend',
			);
		}

		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
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
