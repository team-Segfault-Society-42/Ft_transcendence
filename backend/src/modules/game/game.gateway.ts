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

  constructor(
    private readonly gameService: GameService,
    private readonly usersService: UsersService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected : ${client.id}`);
    const result = await this.gameService.processPlayerDisconnection(client.id);
    if (result) {
      this.server.to(result.gameId).emit('game_updated', result.game);
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
      const newGameState = await this.gameService.playMove(
        body.gameId,
        client.id,
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
      const updateGame = this.gameService.requestReplay(body.gameId, client.id);
      this.server.to(body.gameId).emit('game_updated', updateGame);
      return updateGame;
    } catch (error) {
      client.emit('game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
