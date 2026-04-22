import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { MatchesService } from './matches.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AchievementsService } from './achievements.service';

@Module({
  imports: [PrismaModule, forwardRef(() => UsersModule), JwtModule.register({
    secret: process.env.JWT_SECRET
  })],
  providers: [GameService, GameGateway, MatchesService, AchievementsService],
  controllers: [GameController],
  exports: [MatchesService],
})
export class GameModule {}
