import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { TwoFactorService } from './twofa.service';

@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '8h' },
		}),
		PrismaModule,
		HttpModule,
	],
	controllers: [AuthController, OAuthController],
	providers: [AuthService, OAuthService, TwoFactorService, JwtAuthGuard],
	exports: [JwtAuthGuard],
})
export class AuthModule {}
