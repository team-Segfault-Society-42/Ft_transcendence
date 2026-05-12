import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import type { AuthSocket } from '../auth/jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PresenceService } from './presence.service';

const rawOrigins = process.env.CORS_ORIGINS ?? '';
const allowedOrigins = rawOrigins
	.split(',')
	.map((origin) => origin.trim())
	.filter((origin) => origin !== '');

@WebSocketGateway({
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
})

export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly presenceService: PresenceService) {}

	handleConnection(client: AuthSocket) {
		const userId = client.data.user?.sub;
		console.log('[PresenceGateway] socket connected:', client.id);
		console.log('[PresenceGateway] authenticated user:', userId);

		if (!userId) {
			console.log('[PresenceGateway] missing authenticated user');
			client.disconnect();
			return;
		}

		this.presenceService.connectUser(userId, client.id);
		console.log('[PresenceGateway] user connected to presence service');
	}

	handleDisconnect(client: AuthSocket) {
		console.log('[PresenceGateway] socket disconnected:', client.id);
		this.presenceService.disconnectSocket(client.id);
	}
}
