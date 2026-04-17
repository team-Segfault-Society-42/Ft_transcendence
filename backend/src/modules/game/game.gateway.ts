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
import { PublicPlayerProfile } from './game.types';
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

  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
  ) {}

  private getTimerKey(gameId: string, role: 'X' | 'O') {
    return `${gameId}:${role}`;
  }

  private clearTimerForfeit(gameId: string, role: 'X' | 'O') {
    const timerKey = this.getTimerKey(gameId, role);
    const timer = this.timersForfeit.get(timerKey);

    if (timer) {
      clearTimeout(timer);
      this.timersForfeit.delete(timerKey);
    }
  }

  private startReconnectTimer(gameId: string, role: 'X' | 'O') {
    const timerKey = this.getTimerKey(gameId, role);
    this.clearTimerForfeit(gameId, role);

    const timer = setTimeout(() => {
      this.gameService
        .finalizeReconnectTimeout(gameId, role)
        .then((result) => {
          if (result) {
            this.server.to(gameId).emit('game_updated', result.game);
          }
        })
        .catch((error) => {
          console.error('Reconnect timeout error:', error);
        })
        .finally(() => {
          this.timersForfeit.delete(timerKey);
        });
    }, 45000);

    this.timersForfeit.set(timerKey, timer);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected : ${client.id}`);
    const result = this.gameService.processPlayerDisconnection(client.id);
    if (!result) return;
    if (result.game.status === 'playing')
      this.startReconnectTimer(result.gameId, result.role);
    this.server.to(result.gameId).emit('game_updated', result.game);
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

      await client.join(body.gameId);

      console.log(`Client ${client.id} joined room ${body.gameId} as ${role}`);
      this.server.to(body.gameId).emit('game_updated', game);
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
      this.server.to(body.gameId).emit('game_updated', newGameState);
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
      this.server.to(body.gameId).emit('game_updated', updateGame);
      return updateGame;
    } catch (error) {
      client.emit('game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
