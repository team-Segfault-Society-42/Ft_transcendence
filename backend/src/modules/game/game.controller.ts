import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { GameService } from './game.service';
import type { AuthRequest } from 'src/auth/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  createGame(@Req() req: AuthRequest) {
    const gameId = this.gameService.createGame(req.user.sub);
    return { gameId };
  }

  @Get('active')
  getActiveGame(@Req() req: AuthRequest) {
    return this.gameService.getActiveGameByUserId(req.user.sub);
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
