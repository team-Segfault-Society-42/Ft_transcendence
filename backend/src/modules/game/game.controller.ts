import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { GameService } from './game.service';
import type { AuthRequest } from 'src/auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import {
  	ApiTags,
  	ApiOperation,
  	ApiParam,
  	ApiResponse,
  	ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('Game')
@Controller('game')
export class GameController {
  	constructor(
    	private readonly gameService: GameService,
    	private readonly usersService: UsersService
  	) {}

@ApiCookieAuth()
@ApiOperation({ summary: 'Create a new game' })
@ApiResponse({ status: 201, description: 'Game created, returns { gameId }' })
@ApiResponse({ status: 401, description: 'Not authenticated' })
@Post('create')
async createGame(@Req() req: AuthRequest) {
    const user = await this.usersService.getUser(req.user.sub);
    const gameId = this.gameService.createGame(user);
    return { gameId };
	}

@ApiCookieAuth()
@ApiOperation({ summary: 'Get active game for the current user' })
@ApiResponse({ status: 200, description: 'Returns the active game or null' })
@ApiResponse({ status: 401, description: 'Not authenticated' })
@Get('active')
getActiveGame(@Req() req: AuthRequest) {
    return this.gameService.getActiveGameByUserId(req.user.sub);
	}

@ApiCookieAuth()
@ApiOperation({ summary: 'Get all live games' })
@ApiResponse({ status: 200, description: 'Returns list of live games' })
@Get('liveGames')
getLiveGames(@Req() req: AuthRequest) {
    return this.gameService.getLiveGames(req.user.sub);
	}

@ApiCookieAuth()
@ApiOperation({ summary: 'Get a game by ID' })
@ApiParam({ name: 'id', description: 'Game ID', example: 'game_abc123' })
@ApiResponse({ status: 200, description: 'Returns the game state' })
@ApiResponse({ status: 404, description: 'Game not found' })
@Get(':id')
getGame(@Param('id') gameId: string) {
    return this.gameService.getGameById(gameId);
	}

@ApiCookieAuth()
@ApiOperation({ summary: 'Leave or cancel a game' })
@ApiParam({ name: 'id', description: 'Game ID', example: 'game_abc123' })
@ApiResponse({ status: 200, description: 'Successfully left the game' })
@ApiResponse({ status: 401, description: 'Not authenticated' })
@ApiResponse({ status: 404, description: 'Game not found' })
@Post(':id/leave')
leaveGame(@Param('id') gameId: string, @Req() req: AuthRequest) {
    return this.gameService.leaveGame(gameId, req.user.sub);
	}

@ApiCookieAuth()
@ApiOperation({ summary: 'Get finished game history by game ID' })
@ApiParam({ name: 'id', description: 'Game ID', example: 'game_abc123' })
@ApiResponse({ status: 200, description: 'Returns match history' })
@ApiResponse({ status: 400, description: 'Game is not finished yet' })
@ApiResponse({ status: 404, description: 'Game not found' })
@Get(':id/history')
getFinishedGameHistory(@Param('id') gameId: string) {
    return this.gameService.getFinishedGamesHistory(gameId);
	}
}