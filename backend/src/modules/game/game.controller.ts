import { Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  createGame() {
    const gameId = this.gameService.creatGame();
    return { gameId };
  }
}
