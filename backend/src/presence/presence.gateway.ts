import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Namespace } from 'socket.io';
import type { AuthSocket, JwtPayload } from '../auth/jwt-auth.guard';
import { extractAccessTokenFromCookie } from '../auth/utils/extract-access-token-from-cookie';
import { PresenceService } from './presence.service';

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

	afterInit(): void {
		this.presenceService.setServer(this.server);
	}

	/**
	 * @description Authenticates a presence socket connection using the access_token cookie.
	 * @param client - Socket.IO client attempting to connect.
	 * @returns Nothing.
	 * @remarks Connections without a valid access_token are rejected immediately.
	 */
	async handleConnection(client: AuthSocket) {
		const user = await this.getUserFromSocket(client);

		if (!user) {
			client.disconnect();
			return;
		}

		client.data.user = user;

		const connection = this.presenceService.connectUser(
			user.sub,
			client.id,
		);

		if (!connection.connected) {
			client.disconnect();
			return;
		}

		if (connection.wasOffline) {
			await this.presenceService.emitFriendStatusChange(
				user.sub,
			);
		}
	}

	/**
	 * @description Removes the disconnected socket from realtime presence tracking.
	 * @param client - Disconnected Socket.IO client.
	 * @returns Nothing.
	 * @remarks Friend presence updates are emitted only when the user fully transitions offline.
	 */
	async handleDisconnect(client: AuthSocket) {
		const result =
			this.presenceService.disconnectSocket(client.id);

		if (!result || !result.isOffline) {
			return;
		}

		await this.presenceService.emitFriendStatusChange(
			result.userId,
		);
	}

	/**
	 * @description Extracts and verifies the access_token from a Socket.IO handshake cookie header.
	 * @param client - Socket.IO client.
	 * @returns Verified JWT payload or null when invalid.
	 * @remarks verifyAsync validates both signature and expiration.
	 */
	private async getUserFromSocket(
		client: AuthSocket,
	): Promise<JwtPayload | null> {
		const token = extractAccessTokenFromCookie(
			client.handshake.headers.cookie,
		);

		if (!token) {
			return null;
		}

		try {
			return await this.jwtService.verifyAsync<JwtPayload>(
				token,
			);
		} catch {
			return null;
		}
	}
}
