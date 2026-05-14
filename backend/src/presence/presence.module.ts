import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PresenceGateway } from './presence.gateway';
import { PresenceService } from './presence.service';
import { FriendsModule } from '../friends/friends.module';
import { GameModule } from '../modules/game/game.module';

@Module({
	imports: [
		AuthModule,
		forwardRef(() => FriendsModule),
		forwardRef(() => GameModule),
		forwardRef(() => AuthModule)
	],
	providers: [PresenceGateway, PresenceService],
	exports: [PresenceService],
})
export class PresenceModule {}
