import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
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
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join_chat')
  handleJoinChat(@ConnectedSocket() client: AuthSocket) {
    client.emit('chat_ready');
  }
}
