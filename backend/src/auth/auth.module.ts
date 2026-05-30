import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PresenceModule } from '../presence/presence.module';
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
		forwardRef(() => PresenceModule),
	],
	controllers: [AuthController, OAuthController],
	providers: [AuthService, OAuthService, TwoFactorService, JwtAuthGuard],
	exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
