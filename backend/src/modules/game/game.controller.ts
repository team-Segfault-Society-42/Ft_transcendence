import { Controller, Get, Param, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  createGame() {
    const gameId = this.gameService.createGame();
    return { gameId };
  }

  @Get('liveGames')
  getLiveGames() {
    return this.gameService.getLiveGames();
  }

  @Get(':id')
  getGame(@Param('id') gameId: string) {
    return this.gameService.getGameById(gameId);
  }

  @Get(':id/history')
  getFinishedGameHistory(@Param('id') gameId: string) {
    return this.gameService.getFinishedGamesHistory(gameId);
  }
}
