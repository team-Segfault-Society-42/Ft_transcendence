import { Body, Controller, Post, Get, UseGuards, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('login')
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { access_token } = await this.authService.login(loginDto);

		res.cookie('access_token', access_token, {
			httpOnly: true,
		});

		return { message: 'Login successful' };
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	me(@Req() req) {
		return this.authService.me(req.user.sub);
	}
}
