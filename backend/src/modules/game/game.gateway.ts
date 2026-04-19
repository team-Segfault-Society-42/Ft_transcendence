import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { PlayMoveDto } from './dto/play-move.dto';
import { Server, Socket } from 'socket.io';
import { GameState } from './game.types';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import type { AuthSocket } from 'src/auth/jwt-auth.guard';

const rawOrigins = process.env.CORS_ORIGINS ?? '';
const parts = rawOrigins.split(',');

const trimmedOrigins = parts.map(function (origin) {
  return origin.trim();
});

const allowedOrigins = trimmedOrigins.filter(function (origin) {
  return origin !== '';
});

@WebSocketGateway({
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})
@UseGuards(JwtAuthGuard)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private timersForfeit = new Map<string, NodeJS.Timeout>();
  private turnTimers = new Map<string, NodeJS.Timeout>();
  private readonly RECONNECT_GRACE_MS = 20000;
  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
  ) {}

  private getTimerKey(gameId: string, role: 'X' | 'O') {
    return `${gameId}:${role}`;
  }

  private clearTurnTimer(gameId: string) {
    const timer = this.turnTimers.get(gameId);

    if (timer) {
      clearTimeout(timer);
      this.turnTimers.delete(gameId);
    }
  }

  private startReconnectTimer(gameId: string, role: 'X' | 'O') {
    const timerKey = this.getTimerKey(gameId, role);
    this.clearTimerForfeit(gameId, role);

    console.log(`[RECONNECT] start grace period for ${role} in game ${gameId}`);

    const timer = setTimeout(() => {
      this.gameService
        .finalizeReconnectTimeout(gameId, role)
        .then((result) => {
          if (result) {
            this.emitGameUpdate(gameId, result.game);
          }
        })
        .catch((error) => {
          console.error('Reconnect timeout error:', error);
        })
        .finally(() => {
          this.timersForfeit.delete(timerKey);
        });
    }, this.RECONNECT_GRACE_MS);

    this.timersForfeit.set(timerKey, timer);
  }

  private clearTimerForfeit(gameId: string, role: 'X' | 'O') {
    const timerKey = this.getTimerKey(gameId, role);
    const timer = this.timersForfeit.get(timerKey);

    if (timer) {
      clearTimeout(timer);
      console.log(`[RECONNECT] cleared timer for ${role} in game ${gameId}`);
      this.timersForfeit.delete(timerKey);
    }
  }

  private getSpectatorsCnt(gameId: string, game: GameState): number {
    const room = this.server.sockets.adapter.rooms.get(gameId);
    if (!room) return 0;

    let connectedPlayers = 0;

    const socketId_X = game.players.X.socketId;
    const socketId_O = game.players.O.socketId;

    if (socketId_X && room.has(socketId_X)) connectedPlayers++;
    if (socketId_O && room.has(socketId_O)) connectedPlayers++;

    return Math.max(0, room.size - connectedPlayers);
  }

  private emitGameUpdate(gameId: string, game: GameState) {
    this.server.to(gameId).emit('game_updated', {
      ...game,
      spectatCnt: this.getSpectatorsCnt(gameId, game),
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`);
  }

  handleDisconnect(client: AuthSocket) {
    console.log(`Client disconnected : ${client.id}`);
    const result = this.gameService.processPlayerDisconnection(client.id);
    if (result) {
      if (result.game.status === 'playing')
        this.startReconnectTimer(result.gameId, result.role);
      this.emitGameUpdate(result.gameId, result.game);
      return;
    }
    const gameId = client.data.currentGameId;
    if (!gameId) return;

    try {
      const game = this.gameService.getGameById(gameId);
      this.emitGameUpdate(gameId, game);
    } catch (error) {
      client.emit('game_error', {
        message: error instanceof Error ? error.message : 'Not found',
      });
    }
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody() body: { gameId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    try {
      const userId = client.data.user.sub;

      const userProfile = await this.usersService.getUser(userId);

      const { game, role } = this.gameService.joinGame(
        body.gameId,
        client.id,
        userId,
        userProfile,
      );

      if (role === 'X' || role === 'O')
        this.clearTimerForfeit(body.gameId, role);

      await client.join(body.gameId);
      client.data.currentGameId = body.gameId;

      console.log(`Client ${client.id} joined room ${body.gameId} as ${role}`);
      this.emitGameUpdate(body.gameId, game);
      client.emit('joined_as', { role });
    } catch (error) {
      console.log('join_game error:', error);
      client.emit('game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('play_move')
  async handlePlayMove(
    @MessageBody() body: PlayMoveDto,
    @ConnectedSocket() client: AuthSocket,
  ) {
    try {
      const userId = client.data.user.sub;
      const newGameState = await this.gameService.playMove(
        body.gameId,
        userId,
        body.r,
        body.c,
      );
      this.emitGameUpdate(body.gameId, newGameState);
      return newGameState;
    } catch (error) {
      client.emit('game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('request_replay')
  handleRequestReplay(
    @MessageBody() body: { gameId: string },
    @ConnectedSocket() client: AuthSocket,
  ) {
    try {
      const userId = client.data.user.sub;
      const updateGame = this.gameService.requestReplay(body.gameId, userId);
      this.emitGameUpdate(body.gameId, updateGame);
      return updateGame;
    } catch (error) {
      client.emit('game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
