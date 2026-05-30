import {
	Body,
	Controller,
	Get,
	Patch,
	Post,
	Req,
	Res,
	UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCookieAuth,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DisableTwoFactorDto } from './dto/disable-twofa.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TwoFactorCodeDto } from './dto/twofa-code.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { AuthRequest, JwtPayload } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { TwoFactorService } from './twofa.service';
import { PresenceService } from '../presence/presence.service';

const isProduction = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
	httpOnly: true,
	secure: isProduction,
	sameSite: 'lax' as const,
	path: '/',
};

const accessTokenCookieOptions = {
	...baseCookieOptions,
	maxAge: 8 * 60 * 60 * 1000,
};

const twoFactorPendingCookieOptions = {
	...baseCookieOptions,
	maxAge: 5 * 60 * 1000,
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
	private readonly authService: AuthService,
	private readonly twoFactorService: TwoFactorService,
	private readonly jwtService: JwtService,
	private readonly presenceService: PresenceService,
	) {}

	@Public()
	@Post('register')
	@ApiOperation({ summary: 'Register a new user and start a session' })
	@ApiBody({ type: RegisterDto })
	@ApiCreatedResponse({ description: 'User registered successfully' })
	@ApiBadRequestResponse({ description: 'Invalid input data' })
	@ApiConflictResponse({ description: 'Email or username already exists' })
	async register(
		@Body() registerDto: RegisterDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const user = await this.authService.register(registerDto);
		const accessToken = await this.authService.signTokenForUser(user);

		res.cookie('access_token', accessToken, accessTokenCookieOptions);
		res.clearCookie('2fa_pending', baseCookieOptions);

		return user;
	}

	/**
	 * @description Authenticates a local user and starts either a full session or a 2FA pending session.
	 * @param loginDto - Email and password validated by LoginDto.
	 * @param res - Express response used to set HttpOnly authentication cookies.
	 * @returns A frontend message key and whether 2FA completion is required.
	 * @remarks A user with 2FA enabled must only receive a temporary 2fa_pending cookie, never a full access_token.
	 */
	@Public()
	@Post('login')
	@ApiOperation({ summary: 'Log in a user and set the correct HttpOnly auth cookie' })
	@ApiBody({ type: LoginDto })
	@ApiCreatedResponse({ description: 'Login successful or 2FA required' })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials' })
	async login(
	@Body() loginDto: LoginDto,
	@Res({ passthrough: true }) res: Response,
	) {
		const result = await this.authService.login(loginDto);

		if (result.type === '2fa_required') {
			res.cookie(
			'2fa_pending',
			result.two_factor_token,
			twoFactorPendingCookieOptions,
			);

			res.clearCookie('access_token', baseCookieOptions);

			return {
			message: 'AUTH_2FA_REQUIRED',
			twoFactorRequired: true,
			};
		}

		res.cookie('access_token', result.access_token, accessTokenCookieOptions);
		res.clearCookie('2fa_pending', baseCookieOptions);

		return {
			message: 'AUTH_LOGIN_SUCCESS',
			twoFactorRequired: false,
		};
	}

	/**
	 * @description Clears authentication cookies and disconnects active sockets for the logged-out user when possible.
	 * @param req - Request containing the current access_token cookie, if present.
	 * @param res - Express response used to clear auth cookies.
	 * @returns A frontend message key confirming logout.
	 * @remarks Logout is public so it can safely clear stale cookies even when the access token is missing or expired.
	 */
	@Public()
	@Post('logout')
	@ApiOperation({ summary: 'Log out the current user and clear auth cookies' })
	@ApiCreatedResponse({ description: 'Logout successful' })
	async logout(
	@Req() req: Request,
	@Res({ passthrough: true }) res: Response,
	) {
		const token = req.cookies?.['access_token'];
		let userId: number | null = null;

		if (token) {
			try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
			userId = payload.sub;
			} catch {
			userId = null;
			}
		}

		res.clearCookie('access_token', baseCookieOptions);
		res.clearCookie('2fa_pending', baseCookieOptions);

		if (userId !== null) {
			this.presenceService.disconnectUserSockets(userId);
		}

		return { message: 'AUTH_LOGOUT_SUCCESS' };
	}

	@Get('me')
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Get the currently authenticated user' })
	@ApiOkResponse({ description: 'Authenticated user returned successfully' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	me(@Req() req: AuthRequest) {
		return this.authService.me(req.user.sub);
	}

	/**
	 * @description Silently checks whether the browser currently has a valid full session.
	 * @param req - Request containing the optional access_token cookie.
	 * @returns Authentication state and the current safe private user shape when authenticated.
	 * @remarks This route is public by design to avoid expected 401 console noise before login.
	 */
	@Public()
	@Get('session')
	@ApiOperation({ summary: 'Silently check whether the current browser session is authenticated' })
	@ApiOkResponse({ description: 'Session state returned successfully' })
	async session(@Req() req: Request) {
	const token = req.cookies?.['access_token'];

	if (!token) {
		return { authenticated: false, user: null };
	}

	try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
			const user = await this.authService.me(payload.sub);

			return { authenticated: true, user };
	} catch {
			return { authenticated: false, user: null };
	}
	}

	@Post('2fa/enable')
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Generate 2FA setup data for the authenticated user' })
	@ApiCreatedResponse({ description: '2FA setup data generated successfully' })
	@ApiBadRequestResponse({ description: '2FA is already enabled' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async enableTwoFactor(@Req() req: AuthRequest) {
		return this.twoFactorService.generateSetup(req.user.sub);
	}

	@Post('2fa/verify')
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Verify 2FA setup and enable it for the authenticated user' })
	@ApiBody({ type: TwoFactorCodeDto })
	@ApiCreatedResponse({ description: '2FA enabled successfully' })
	@ApiBadRequestResponse({ description: 'Invalid code or no setup in progress' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async verifyTwoFactorSetup(
	@Req() req: AuthRequest,
	@Body() twoFactorCodeDto: TwoFactorCodeDto,
	) {
		return this.twoFactorService.verifySetup(req.user.sub, twoFactorCodeDto.code);
	}

	/**
	 * @description Completes a partial 2FA login and upgrades it into a full authenticated session.
	 * @param twoFactorCodeDto - TOTP code validated by TwoFactorCodeDto.
	 * @param req - Request containing the 2fa_pending cookie.
	 * @param res - Express response used to set access_token and clear 2fa_pending.
	 * @returns A frontend message key confirming 2FA login success.
	 * @throws UnauthorizedException when the 2fa_pending cookie is missing or invalid.
	 * @remarks This route must never accept an access_token as proof of 2FA completion.
	 */
	@Public()
	@Post('2fa/login')
	@ApiOperation({ summary: 'Complete login with a valid TOTP code' })
	@ApiBody({ type: TwoFactorCodeDto })
	@ApiCreatedResponse({ description: '2FA login completed successfully' })
	@ApiBadRequestResponse({ description: 'Invalid code or 2FA not enabled' })
	@ApiUnauthorizedResponse({ description: 'Missing or invalid 2FA pending token' })
	async completeTwoFactorLogin(
	@Body() twoFactorCodeDto: TwoFactorCodeDto,
	@Req() req: Request,
	@Res({ passthrough: true }) res: Response,
	) {
		const pendingToken = req.cookies?.['2fa_pending'];

		if (!pendingToken) {
			throw new UnauthorizedException('Missing two-factor pending token');
		}

		const payload =
			await this.twoFactorService.verifyTwoFactorPendingToken(pendingToken);

		await this.twoFactorService.verifyLoginCode(
			payload.sub,
			twoFactorCodeDto.code,
		);

		const accessToken = await this.authService.signTokenForUser({
			id: payload.sub,
			email: payload.email,
		});

		res.cookie('access_token', accessToken, accessTokenCookieOptions);
		res.clearCookie('2fa_pending', baseCookieOptions);

		return {
			message: 'AUTH_2FA_LOGIN_SUCCESS',
		};
	}

	@Post('2fa/disable')
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Disable two-factor authentication' })
	@ApiBody({ type: DisableTwoFactorDto })
	@ApiOkResponse({ description: 'Two-factor authentication disabled successfully' })
	@ApiBadRequestResponse({ description: 'Invalid code or 2FA is not enabled' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	async disableTwoFactor(
	@Req() req: AuthRequest,
	@Body() dto: DisableTwoFactorDto,
	) {
		return this.twoFactorService.disableTwoFactor(req.user.sub, dto.code);
	}

	@Patch('me/password')
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Update current authenticated user password' })
	@ApiBody({ type: UpdatePasswordDto })
	@ApiOkResponse({ description: 'Password updated successfully' })
	@ApiBadRequestResponse({ description: 'Invalid password payload' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized or invalid current password' })
	updatePassword(
	@Req() req: AuthRequest,
	@Body() dto: UpdatePasswordDto,
	) {
		return this.authService.updatePassword(
			req.user.sub,
			dto.currentPassword,
			dto.newPassword,
		);
	}

	@Patch('me/email')
	@ApiCookieAuth()
	@ApiOperation({ summary: 'Update current authenticated user email' })
	@ApiBody({ type: UpdateEmailDto })
	@ApiOkResponse({ description: 'Email updated successfully' })
	@ApiBadRequestResponse({ description: 'Invalid email payload' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized or invalid current password' })
	@ApiConflictResponse({ description: 'Email already exists' })
	updateEmail(
	@Req() req: AuthRequest,
	@Body() dto: UpdateEmailDto,
	) {
		return this.authService.updateEmail(
			req.user.sub,
			dto.currentPassword,
			dto.newEmail,
		);
	}
}
