import { Body, Controller, Post, Get, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('register')
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Public()
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
	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie('access_token', {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
		});

		return { message: 'Logout successful' };
	}

	@Get('me')
	me(@Req() req) {
		return this.authService.me(req.user.sub);
	}
}
