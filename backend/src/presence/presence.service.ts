import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
	private readonly onlineUsers = new Map<number, Set<string>>();
	private readonly usersBySocket = new Map<string, number>();

	connectUser(userId: number, socketId: string): boolean {
		const sockets = this.onlineUsers.get(userId) ?? new Set<string>();
		const wasOffline = sockets.size === 0;

		sockets.add(socketId);
		this.onlineUsers.set(userId, sockets);
		this.usersBySocket.set(socketId, userId);

		return wasOffline;
	}

	disconnectSocket(socketId: string): { userId: number; isOffline: boolean } | null {
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
}
