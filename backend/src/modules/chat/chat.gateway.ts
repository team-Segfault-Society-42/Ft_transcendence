import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AuthSocket } from 'src/auth/jwt-auth.guard';
import { SendChatMessageDto } from './dto/chat.dto';

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
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('join_chat')
  handleJoinChat(@ConnectedSocket() client: AuthSocket) {
    client.emit('chat_ready');
  }

  @SubscribeMessage('chat_send')
  handleChatSend(
    @MessageBody() body: SendChatMessageDto,
    @ConnectedSocket() client: AuthSocket,
  ) {
    const message = {
      id: Date.now(),
      content: body.content,
      createdAt: new Date().toISOString(),
      user: {
        id: client.data.user.sub,
        username: 'User',
        avatar: null,
      },
    };

    this.server.emit('chat_message', message);
  }
}
