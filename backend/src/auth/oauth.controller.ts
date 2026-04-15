import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Public } from './public.decorator';

@Controller('auth')
export class OAuthController {
	@Public()
	@Get('google')
	startGoogleOAuth() {
		return {
			message: 'OAuth Google login start route',
		};
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
