import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PresenceModule } from '../presence/presence.module';
import { GameModule } from '../modules/game/game.module';

@Module({
	imports: [PrismaModule, forwardRef(() =>PresenceModule), GameModule],
	controllers: [FriendsController],
	providers: [FriendsService],
	exports: [FriendsService],
})
export class FriendsModule {}
