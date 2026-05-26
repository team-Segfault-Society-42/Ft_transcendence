import {
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { Namespace } from 'socket.io';
import type { FriendEventName } from '../friends/friends.events';
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
	private readonly onlineUsers = new Map<number, Set<string>>();
	private readonly usersBySocket = new Map<string, number>();

	private server: Namespace | null = null;

	constructor(
		@Inject(forwardRef(() => FriendsService))
		private readonly friendsService: FriendsService,

		@Inject(forwardRef(() => GameService))
		private readonly gameService: GameService,
	) {}

	setServer(server: Namespace): void {
		this.server = server;
	}

	/**
	 * @description Emits a socket event to every active socket of a user.
	 * @param userId - Target user ID.
	 * @param eventName - Socket event name.
	 * @param payload - Optional payload emitted with the event.
	 * @returns Nothing.
	 */
	private emitToUserSockets(
		userId: number,
		eventName: string,
		payload?: unknown,
	): void {
		if (!this.server) {
			return;
		}

		const socketIds = this.getUserSocketIds(userId);

		for (const socketId of socketIds) {
			this.server.to(socketId).emit(eventName, payload);
		}
	}

	/**
	 * @description Registers a socket as online for a user.
	 * @param userId - Authenticated user ID.
	 * @param socketId - Connected socket ID.
	 * @returns Connection state and whether the user was previously offline.
	 * @remarks Multiple tabs/devices are supported through multiple socket IDs per user.
	 */
	connectUser(
		userId: number,
		socketId: string,
	): { connected: boolean; wasOffline: boolean } {
		const sockets =
			this.onlineUsers.get(userId) ?? new Set<string>();

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

	/**
	 * @description Removes a disconnected socket from presence tracking.
	 * @param socketId - Disconnected socket ID.
	 * @returns User offline transition information or null when unknown.
	 */
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

	/**
	 * @description Disconnects all active sockets for a user.
	 * @param userId - User whose active sockets should be closed.
	 * @returns Nothing.
	 * @remarks Used during logout to force realtime session cleanup.
	 */
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

	/**
	 * @description Emits a realtime friend status update to all accepted friends.
	 * @param userId - User whose status changed.
	 * @returns Nothing.
	 */
	async emitFriendStatusChange(userId: number) {
		const friendIds =
			await this.friendsService.getAcceptedFriendIds(
				userId,
			);

		const payload = this.buildFriendStatus(userId);

		for (const friendId of friendIds) {
			this.emitToUserSockets(
				friendId,
				'friend_status_changed',
				payload,
			);
		}
	}

	/**
	 * @description Builds the realtime presence payload exposed to friends.
	 * @param userId - User whose presence is being exposed.
	 * @returns Presence summary payload.
	 */
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

	emitFriendEvent(
		userId: number,
		eventName: FriendEventName,
	): void {
		this.emitToUserSockets(userId, eventName);
	}

	emitFriendEvents(
		userIds: number[],
		eventName: FriendEventName,
	): void {
		for (const userId of userIds) {
			this.emitFriendEvent(userId, eventName);
		}
	}

	/**
	 * @description Emits realtime active game updates to all sockets of a user.
	 * @param userId - Target user ID.
	 * @param activeGame - Active game payload or null when cleared.
	 * @returns Nothing.
	 */
	emitActiveGameUpdated(
		userId: number,
		activeGame: ActiveGamePayload | null,
	): void {
		this.emitToUserSockets(
			userId,
			'active_game_updated',
			activeGame,
		);
	}
}
