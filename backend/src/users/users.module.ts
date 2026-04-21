import { Module, forwardRef} from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GameModule } from 'src/modules/game/game.module';

@Module({
  imports: [PrismaModule, forwardRef(() => GameModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
