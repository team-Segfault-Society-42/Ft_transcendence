import {
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { AuthSocket, JwtPayload } from '../auth/jwt-auth.guard';
import { PresenceService } from './presence.service';
import { Namespace } from 'socket.io';

const rawOrigins = process.env.CORS_ORIGINS ?? '';
const allowedOrigins = rawOrigins
	.split(',')
	.map((origin) => origin.trim())
	.filter((origin) => origin !== '');

@WebSocketGateway({
	namespace: '/presence',
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
})
export class PresenceGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly presenceService: PresenceService,
		private readonly jwtService: JwtService,
	) {}

	@WebSocketServer()
	server!: Namespace;

	afterInit() {
		this.presenceService.setServer(this.server);
	}

	async handleConnection(client: AuthSocket) {
		const user = await this.getUserFromSocket(client);

		if (!user) {
			client.disconnect();
			return;
		}

		client.data.user = user;
		const connection = this.presenceService.connectUser(user.sub, client.id);

		if (!connection.connected) {
			client.disconnect();
			return;
		}

		if (connection.wasOffline) {
			await this.presenceService.emitFriendStatusChange(user.sub);
		}
	}

	async handleDisconnect(client: AuthSocket) {
		const result = this.presenceService.disconnectSocket(client.id);

		if (!result || !result.isOffline) {
			return;
		}

		await this.presenceService.emitFriendStatusChange(result.userId);
	}

	private async getUserFromSocket(
		client: AuthSocket,
	): Promise<JwtPayload | null> {
		const token = this.extractAccessToken(client);

		if (!token) {
			return null;
		}

		try {
			// verifyAsync validates JWT signature AND expiration by default
			return await this.jwtService.verifyAsync<JwtPayload>(token);
		} catch {
			return null;
		}
	}

	private extractAccessToken(client: AuthSocket): string | null {
		const rawCookies = client.handshake.headers.cookie;

		if (!rawCookies) {
			return null;
		}

		for (const cookie of rawCookies.split(';')) {
			const [key, ...valueParts] = cookie.trim().split('=');
			const value = valueParts.join('=');

			if (key === 'access_token' && value) {
				try {
					return decodeURIComponent(value);
				} catch {
					return null;
				}
			}
		}

		return null;
	}
}
