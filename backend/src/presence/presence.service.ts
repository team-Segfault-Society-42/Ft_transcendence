import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Namespace } from 'socket.io';
import { FriendsService } from '../friends/friends.service';
import { GameService } from '../modules/game/game.service';

const MAX_PRESENCE_SOCKETS_PER_USER = 20;

type ActiveGameStatus = 'idle' | 'waiting' | 'playing';

interface ActiveGamePayload {
	gameId: string;

	status: ActiveGameStatus;

	playerX?: {
		username: string;
		avatar?: string | null;
	};

	playerO?: {
		username: string;
		avatar?: string | null;
	};
}

@Injectable()
export class PresenceService {
	constructor(
		@Inject(forwardRef(() => FriendsService))
		private readonly friendsService: FriendsService,

		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
	) {}
	private readonly onlineUsers = new Map<number, Set<string>>();
	private readonly usersBySocket = new Map<string, number>();
	private server: Namespace | null = null;

	setServer(server: Namespace) {
		this.server = server;
	}
	connectUser(
		userId: number,
		socketId: string,
	): { connected: boolean; wasOffline: boolean } {
		const sockets = this.onlineUsers.get(userId) ?? new Set<string>();

		if (sockets.size >= MAX_PRESENCE_SOCKETS_PER_USER) {
			return {
				connected: false,
				wasOffline: false,
			};
		}

		const wasOffline = sockets.size === 0;

		sockets.add(socketId);
		this.onlineUsers.set(userId, sockets);
		this.usersBySocket.set(socketId, userId);

		return {
			connected: true,
			wasOffline,
		};
	}

	disconnectSocket(
		socketId: string,
	): { userId: number; isOffline: boolean } | null {
		const userId = this.usersBySocket.get(socketId);

		if (userId === undefined) {
			return null;
		}

		this.usersBySocket.delete(socketId);

		const sockets = this.onlineUsers.get(userId);

		if (!sockets) {
			return {
				userId,
				isOffline: true,
			};
		}

		sockets.delete(socketId);

		if (sockets.size === 0) {
			this.onlineUsers.delete(userId);

			return {
				userId,
				isOffline: true,
			};
		}

		return {
			userId,
			isOffline: false,
		};
	}

	isUserOnline(userId: number): boolean {
		return this.onlineUsers.has(userId);
	}

	getUserSocketIds(userId: number): string[] {
		const sockets = this.onlineUsers.get(userId);

		if (!sockets) {
			return [];
		}

		return [...sockets];
	}

	disconnectUserSockets(userId: number): void {
		if (!this.server) {
			return;
		}

		const socketIds = this.getUserSocketIds(userId);

		for (const socketId of socketIds) {
			const socket = this.server.sockets.get(socketId);
			socket?.disconnect(true);
		}
	}

	async emitFriendStatusChange(userId: number) {
		const friendIds = await this.friendsService.getAcceptedFriendIds(userId);

		for (const friendId of friendIds) {
			const socketIds = this.getUserSocketIds(friendId);

			for (const socketId of socketIds) {
				if (!this.server) {
					return;
				}
				this.server
					.to(socketId)
					.emit('friend_status_changed', this.buildFriendStatus(userId));
			}
		}
	}

	private buildFriendStatus(userId: number) {
		const online = this.isUserOnline(userId);

		const activity = online
			? this.gameService.getUserGameActivity(userId)
			: 'offline';

		return {
			userId,
			online,
			inGame: activity === 'playing',
			activity,
		};
	}

	emitFriendsUpdated(userIds: number[]) {
		if (!this.server) {
			return;
		}

		for (const userId of userIds) {
			const socketIds = this.getUserSocketIds(userId);

			for (const socketId of socketIds) {
				this.server.to(socketId).emit('friends_updated');
			}
		}
	}

	emitActiveGameUpdated(userId: number, activeGame: ActiveGamePayload | null) {
		if (!this.server) {
			return;
		}

		const socketIds = this.getUserSocketIds(userId);

		for (const socketId of socketIds) {
			this.server.to(socketId).emit('active_game_updated', activeGame);
		}
	}
}
