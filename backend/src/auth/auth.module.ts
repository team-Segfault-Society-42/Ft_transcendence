import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '1h' },
		}),
		PrismaModule,
	],
	controllers: [AuthController, OAuthController],
	providers: [
		AuthService,
		OAuthService,
		JwtAuthGuard,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},

	],
})
export class AuthModule {}
