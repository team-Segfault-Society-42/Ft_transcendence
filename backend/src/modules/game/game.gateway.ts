import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { PlayMoveDto } from './dto/play-move.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly gameService: GameService) {}
  @SubscribeMessage('play move')
  handlePlayMove(@MessageBody() body: PlayMoveDto) {
	try {
		const updatStateGame = this.gameService.playMove(
		  body.gameId,
		  body.r,
		  body.c,
		);
		this.server.to(body.gameId).emit('updatStateGame', updatStateGame);
		return updatStateGame;
	}
  }
}
