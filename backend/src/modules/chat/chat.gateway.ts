import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';

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
}
