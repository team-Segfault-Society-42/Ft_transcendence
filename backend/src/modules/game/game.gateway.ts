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

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:1024',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected : ${client.id}`);
    const result = this.gameService.processPlayerDisconnection(client.id);
    if (result) {
      this.server.to(result.gameId).emit('game_updated', result.game);
    }
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody() body: { gameId: string; user?: PublicPlayerProfile },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { game, role } = this.gameService.joinGame(
        body.gameId,
        client.id,
        body.user,
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
  handlePlayMove(
    @MessageBody() body: PlayMoveDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const newGameState = this.gameService.playMove(
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
    @ConnectedSocket() client: Socket,
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
