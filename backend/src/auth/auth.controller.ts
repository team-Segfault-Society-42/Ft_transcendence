import { Body, Controller, Post, Get, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import type { AuthRequest } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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
		description: 'Login successful',
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
		const { access_token } = await this.authService.login(loginDto);

		res.cookie('access_token', access_token, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 1000,
		});

		return { message: 'Login successful' };
	}

	@Public()
	@ApiOperation({ summary: 'Log out the current user and clear the auth cookie' })
	@ApiResponse({
		status: 201,
		description: 'Logout successful',
	})
	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('access_token', {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
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
}
