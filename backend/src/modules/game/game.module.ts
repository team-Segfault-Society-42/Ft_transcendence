import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { MatchesService } from './matches.service';

@Module({
  providers: [GameService, GameGateway, MatchesService],
  controllers: [GameController],
})
export class GameModule {}
