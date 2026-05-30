import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ChatModule } from './modules/chat/chat.modules';
import { GameModule } from './modules/game/game.module';
import { PresenceModule } from './presence/presence.module';
import { PrismaModule } from './prisma/prisma.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		UsersModule,
		PrismaModule,
		AuthModule,
		GameModule,
		ChatModule,
		FriendsModule,
		PresenceModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useExisting: JwtAuthGuard,
		},
	],
})
export class AppModule {}
