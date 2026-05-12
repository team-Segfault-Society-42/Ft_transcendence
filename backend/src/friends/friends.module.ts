import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PresenceModule } from '../presence/presence.module';

@Module({
	imports: [PrismaModule, PresenceModule],
	controllers: [FriendsController],
	providers: [FriendsService],
})
export class FriendsModule {}
