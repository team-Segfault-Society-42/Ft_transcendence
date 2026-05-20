import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AuthSocket } from 'src/auth/jwt-auth.guard';
import { SendChatMessageDto } from './dto/chat.dto';
import { UsersService } from 'src/users/users.service';

const rawOrigins = process.env.CORS_ORIGINS ?? '';
const parts = rawOrigins.split(',');

const trimmedOrigins = parts.map(function (origin) {
	return origin.trim();
});

const allowedOrigins = trimmedOrigins.filter(function (origin) {
	return origin !== '';
});

@WebSocketGateway({
	namespace: '/chat',
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
})
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ChatGateway {
	@WebSocketServer()
	server!: Namespace;

	constructor(private readonly usersService: UsersService) {}

	@SubscribeMessage('chat_send')
	async handleChatSend(
		@MessageBody() body: SendChatMessageDto,
		@ConnectedSocket() client: AuthSocket,
	) {
		const user = await this.usersService.getUser(client.data.user.sub);
		const message = {
			id: Date.now(),
			content: body.content,
			createdAt: new Date().toISOString(),
			user: {
				id: client.data.user.sub,
				username: user?.username ?? 'CHAT_UNKNOWN_USER',
				avatar: user?.avatar ?? null,
			},
		};

		this.server.emit('chat_message', message);
	}
}
