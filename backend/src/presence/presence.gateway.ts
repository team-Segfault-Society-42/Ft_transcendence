import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { AuthSocket, JwtPayload } from '../auth/jwt-auth.guard';
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
	constructor(
		private readonly presenceService: PresenceService,
		private readonly jwtService: JwtService,
	) {}

	async handleConnection(client: AuthSocket) {
		const user = await this.getUserFromSocket(client);

		console.log('[PresenceGateway] socket connected:', client.id);
		console.log('[PresenceGateway] authenticated user:', user?.sub);

		if (!user) {
			console.log('[PresenceGateway] missing authenticated user');
			client.disconnect();
			return;
		}

		client.data.user = user;
		this.presenceService.connectUser(user.sub, client.id);

		console.log('[PresenceGateway] user connected to presence service');
	}

	handleDisconnect(client: AuthSocket) {
		console.log('[PresenceGateway] socket disconnected:', client.id);

		this.presenceService.disconnectSocket(client.id);
	}

	private async getUserFromSocket(client: AuthSocket): Promise<JwtPayload | null> {
		const token = this.extractAccessToken(client);

		if (!token) {
			return null;
		}

		try {
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
