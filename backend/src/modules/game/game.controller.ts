import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { GameService } from './game.service';
import type { AuthRequest } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService
  ){}

  @Post('create')
  async createGame(@Req() req: AuthRequest) {
    const user = await this.usersService.getUser(req.user.sub);
    const gameId = this.gameService.createGame(user);
    return { gameId };
  }

  @Get('active')
  getActiveGame(@Req() req: AuthRequest) {
    return this.gameService.getActiveGameByUserId(req.user.sub);
  }

  @Get('liveGames')
  getLiveGames(@Req() req: AuthRequest) {
    return this.gameService.getLiveGames(req.user.sub);
  }

  @Get(':id')
  getGame(@Param('id') gameId: string) {
    return this.gameService.getGameById(gameId);
  }

  @Post(':id/leave')
  leaveGame(@Param('id') gameId: string, @Req() req: AuthRequest,) {
    return this.gameService.leaveGame(gameId, req.user.sub);
  }

  @Get(':id/history')
  getFinishedGameHistory(@Param('id') gameId: string) {
    return this.gameService.getFinishedGamesHistory(gameId);
  }
}
