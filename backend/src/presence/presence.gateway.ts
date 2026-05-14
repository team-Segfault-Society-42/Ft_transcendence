import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketGateway,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import type { AuthSocket, JwtPayload } from '../auth/jwt-auth.guard';
import { PresenceService } from './presence.service';
import { FriendsService } from '../friends/friends.service';
import { Server } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';
import { GameService } from '../modules/game/game.service';

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
		private readonly friendsService: FriendsService,
		private readonly gameService: GameService,
	) {}

	@WebSocketServer()
	server: Server;

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
			await this.emitFriendStatusChange(user.sub);
		}

	}

	async handleDisconnect(client: AuthSocket) {

		const result = this.presenceService.disconnectSocket(client.id);

		if (!result || !result.isOffline) {
			return;
		}

		await this.emitFriendStatusChange(result.userId);
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

	private async emitFriendStatusChange(userId: number) {
		const friendIds = await this.friendsService.getAcceptedFriendIds(userId);

		for (const friendId of friendIds) {
			const socketIds = this.presenceService.getUserSocketIds(friendId);

			for (const socketId of socketIds) {
				this.server.to(socketId).emit(
					'friend_status_changed',
					this.buildFriendStatus(userId),
				);
			}
		}
	}

	private buildFriendStatus(userId: number) {
		const online = this.presenceService.isUserOnline(userId);

		return {
			userId,
			online,
			inGame: online && this.gameService.isUserInGame(userId),
			activity: online
				? this.gameService.getUserGameActivity(userId)
				: 'offline',
		};
	}
}
