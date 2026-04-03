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
  }

  @SubscribeMessage('join_game')
  async handleJoinGame(
    @MessageBody() body: { gameId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const gameState = this.gameService.getGameById(body.gameId);

      await client.join(body.gameId);

      console.log(`Client ${client.id} joined room ${body.gameId}`);
      client.emit('game_updated', gameState);
    } catch (error) {
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
      const updatedStateGame = this.gameService.playMove(
        body.gameId,
        body.r,
        body.c,
      );
      this.server.to(body.gameId).emit('game_updated', updatedStateGame);
      return updatedStateGame;
    } catch (error) {
      client.emit('game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
