import { Module, forwardRef } from '@nestjs/common';
import { GameModule } from 'src/modules/game/game.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AvatarUploadRateLimitGuard } from './avatar-upload-rate-limit.guard';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [PrismaModule, forwardRef(() => GameModule)],
	providers: [UsersService, AvatarUploadRateLimitGuard],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
