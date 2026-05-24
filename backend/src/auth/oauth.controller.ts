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
import {
	ApiBadRequestResponse,
	ApiFoundResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { randomBytes } from 'crypto';
import type { Request, Response } from 'express';
import { URLSearchParams } from 'node:url';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth.service';
import { Public } from './public.decorator';

const isProduction = process.env.NODE_ENV === 'production';

const oauthCookieOptions = {
	httpOnly: true,
	secure: isProduction,
	sameSite: 'lax' as const,
	path: '/',
};

const oauthStateCookieOptions = {
	...oauthCookieOptions,
	maxAge: 5 * 60 * 1000,
};

const accessTokenCookieOptions = {
	...oauthCookieOptions,
	maxAge: 8 * 60 * 60 * 1000,
};

const twoFactorPendingCookieOptions = {
	...oauthCookieOptions,
	maxAge: 5 * 60 * 1000,
};

@ApiTags('OAuth')
@Controller('auth/oauth')
export class OAuthController {
	constructor(
		private readonly oauthService: OAuthService,
		private readonly authService: AuthService,
	) {}

	private getFrontendSuccessRedirectUrl(): string {
		return process.env.FRONTEND_OAUTH_SUCCESS_URL ?? 'http://localhost:1024/';
	}

	private getTwoFactorRedirectUrl(): string {
		return process.env.TWO_FACTOR_URL ?? 'http://localhost:1024/two-factor';
	}

	/**
	 * @description Redirects the browser to the 42 OAuth authorization page.
	 * @param res - Express response used to set the CSRF state cookie and redirect.
	 * @returns Redirect response to the 42 authorization URL.
	 * @throws InternalServerErrorException when required 42 OAuth environment variables are missing.
	 * @remarks The oauth_state cookie is used to protect the callback against CSRF.
	 */
	@Public()
	@Get('42')
	@ApiOperation({ summary: 'Start 42 OAuth login' })
	@ApiFoundResponse({ description: 'Redirects to the 42 OAuth authorization page' })
	startFortyTwoOAuth(@Res() res: Response) {
		const clientId = process.env.FORTYTWO_CLIENT_ID;
		const redirectUri = process.env.FORTYTWO_REDIRECT_URI;

		if (!clientId || !redirectUri) {
			throw new InternalServerErrorException('ERR_OAUTH_42_CONFIG');
		}

		const state = randomBytes(32).toString('hex');

		res.cookie('oauth_state', state, oauthStateCookieOptions);

		const params = new URLSearchParams({
			client_id: clientId,
			redirect_uri: redirectUri,
			response_type: 'code',
			scope: 'public',
			state,
		});

		const authorizationUrl =
			`https://api.intra.42.fr/oauth/authorize?${params.toString()}`;

		return res.redirect(authorizationUrl);
	}

	/**
	 * @description Handles the 42 OAuth callback, validates state, then creates either a full session or a 2FA pending session.
	 * @param code - Authorization code returned by 42.
	 * @param state - CSRF state returned by 42.
	 * @param req - Request containing the stored oauth_state cookie.
	 * @param res - Express response used to set auth cookies and redirect.
	 * @returns Redirect response to the frontend.
	 * @throws BadRequestException when required callback query parameters are missing.
	 * @throws UnauthorizedException when the OAuth state is missing or invalid.
	 * @remarks This route clears oauth_state after successful validation and never exposes OAuth tokens to the frontend.
	 */
	@Public()
	@Get('42/callback')
	@ApiOperation({ summary: 'Handle 42 OAuth callback' })
	@ApiFoundResponse({ description: 'Redirects to the frontend after OAuth login' })
	@ApiBadRequestResponse({ description: 'Missing OAuth callback code or state' })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid OAuth state' })
	async handleFortyTwoCallback(
		@Query('code') code: string | undefined,
		@Query('state') state: string | undefined,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		if (!code) {
			throw new BadRequestException('ERR_OAUTH_MISSING_CODE');
		}

		if (!state) {
			throw new BadRequestException('ERR_OAUTH_MISSING_STATE');
		}

		const storedState = req.cookies?.oauth_state;

		if (!storedState) {
			throw new UnauthorizedException('ERR_OAUTH_MISSING_STORED_STATE');
		}

		if (state !== storedState) {
			throw new UnauthorizedException('ERR_OAUTH_INVALID_STATE');
		}

		const user = await this.oauthService.handleFortyTwoCallback(code);
		const loginResult = await this.authService.createLoginResultForUser(user);

		if (loginResult.type === '2fa_required') {
			res.cookie(
				'2fa_pending',
				loginResult.two_factor_token,
				twoFactorPendingCookieOptions,
			);

			res.clearCookie('access_token', oauthCookieOptions);
		} else {
			res.cookie(
				'access_token',
				loginResult.access_token,
				accessTokenCookieOptions,
			);

			res.clearCookie('2fa_pending', oauthCookieOptions);
		}

		res.clearCookie('oauth_state', oauthCookieOptions);

		const redirectUrl =
			loginResult.type === '2fa_required'
				? this.getTwoFactorRedirectUrl()
				: this.getFrontendSuccessRedirectUrl();

		return res.redirect(redirectUrl);
	}
}
