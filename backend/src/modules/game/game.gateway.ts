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
import { error } from 'node:console';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
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
      await client.join(body.gameId);
      console.log(`Client ${client.id} joined room ${body.gameId}`);
    } catch (error) {
      client.emit('Game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @SubscribeMessage('play move')
  handlePlayMove(
    @MessageBody() body: PlayMoveDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const updatStateGame = this.gameService.playMove(
        body.gameId,
        body.r,
        body.c,
      );
      this.server.to(body.gameId).emit('updatStateGame', updatStateGame);
      return updatStateGame;
    } catch (error) {
      client.emit('Game_error', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
