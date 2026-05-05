import {
	Body,
	Controller,
	Post,
	Get,
	Req,
	Res,
	UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import type { AuthRequest } from './jwt-auth.guard';
import { TwoFactorService } from './twofa.service';
import { TwoFactorCodeDto } from './dto/twofa-code.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly twoFactorService: TwoFactorService,
	) {}

	@Public()
	@ApiOperation({ summary: 'Register a new user' })
	@ApiBody({ type: RegisterDto })
	@ApiResponse({
		status: 201,
		description: 'User registered successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid input data',
	})
	@Post('register')
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Public()
	@ApiOperation({ summary: 'Log in a user and set an HttpOnly JWT cookie' })
	@ApiBody({ type: LoginDto })
	@ApiResponse({
		status: 201,
		description: 'Login successful or 2FA required',
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid credentials',
	})
	@Post('login')
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const result = await this.authService.login(loginDto);

		if (result.type === '2fa_required') {
			res.cookie('2fa_pending', result.two_factor_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 5 * 60 * 1000,
				path: '/',
			});

			res.clearCookie('access_token', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/',
			});

			return {
				message: 'Two-factor authentication required',
				twoFactorRequired: true,
			};
		}

		res.cookie('access_token', result.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 8 * 60 * 60 * 1000,
			path: '/',
		});

		res.clearCookie('2fa_pending', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		return {
			message: 'Login successful',
			twoFactorRequired: false,
		};
	}

	@Public()
	@ApiOperation({ summary: 'Log out the current user and clear auth cookies' })
	@ApiResponse({
		status: 201,
		description: 'Logout successful',
	})
	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('access_token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		res.clearCookie('2fa_pending', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		return { message: 'Logout successful' };
	}

	@ApiOperation({ summary: 'Get the currently authenticated user' })
	@ApiResponse({
		status: 200,
		description: 'Authenticated user returned successfully',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	@Get('me')
	me(@Req() req: AuthRequest) {
		return this.authService.me(req.user.sub);
	}

	@ApiOperation({ summary: 'Generate 2FA setup data for the authenticated user' })
	@ApiResponse({
		status: 201,
		description: '2FA setup data generated successfully',
	})
	@ApiResponse({
		status: 400,
		description: '2FA is already enabled',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	@Post('2fa/enable')
	async enableTwoFactor(@Req() req: AuthRequest) {
		return this.twoFactorService.generateSetup(req.user.sub);
	}

	@ApiOperation({ summary: 'Verify 2FA setup and enable it for the authenticated user' })
	@ApiBody({ type: TwoFactorCodeDto })
	@ApiResponse({
		status: 201,
		description: '2FA enabled successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid code or no setup in progress',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
	})
	@Post('2fa/verify')
	async verifyTwoFactorSetup(
		@Req() req: AuthRequest,
		@Body() twoFactorCodeDto: TwoFactorCodeDto,
	) {
		return this.twoFactorService.verifySetup(req.user.sub, twoFactorCodeDto.code);
	}

	@Public()
	@ApiOperation({ summary: 'Complete login with a valid TOTP code' })
	@ApiBody({ type: TwoFactorCodeDto })
	@ApiResponse({
		status: 201,
		description: '2FA login completed successfully',
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid code or 2FA not enabled',
	})
	@ApiResponse({
		status: 401,
		description: 'Missing or invalid 2FA pending token',
	})
	@Post('2fa/login')
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

		res.cookie('access_token', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 8 * 60 * 60 * 1000,
			path: '/',
		});

		res.clearCookie('2fa_pending', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		});

		return {
			message: 'Two-factor login successful',
		};
	}
}
