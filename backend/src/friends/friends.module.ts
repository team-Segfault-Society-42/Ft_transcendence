import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PresenceModule } from '../presence/presence.module';

@Module({
	imports: [PrismaModule, forwardRef(() =>PresenceModule)],
	controllers: [FriendsController],
	providers: [FriendsService],
	exports: [FriendsService],
})
export class FriendsModule {}
