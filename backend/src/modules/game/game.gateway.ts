import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { GameService, TURN_TIMEOUT_MS } from './game.service';
import { PlayMoveDto } from './dto/play-move.dto';
import { Namespace } from 'socket.io';
import { GameState } from './game.types';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import type { AuthSocket } from 'src/auth/jwt-auth.guard';
import { PresenceService } from '../../presence/presence.service';

const rawOrigins = process.env.CORS_ORIGINS ?? '';
const parts = rawOrigins.split(',');

const trimmedOrigins = parts.map(function (origin) {
	return origin.trim();
});

const allowedOrigins = trimmedOrigins.filter(function (origin) {
	return origin !== '';
});

@WebSocketGateway({
	namespace: '/game',
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
})
@UseGuards(JwtAuthGuard) // TODO: verify if can delete (is no necessary bcz CALLED FOR APP)
export class GameGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server!: Namespace;

	private turnTimers = new Map<string, NodeJS.Timeout>();

	constructor(
		private readonly gameService: GameService,
		private readonly usersService: UsersService,
		private readonly presenceService: PresenceService,
	) {}

	private clearTurnTimer(gameId: string) {
		const timer = this.turnTimers.get(gameId);

		if (timer) {
			clearTimeout(timer);
			this.turnTimers.delete(gameId);
		}
	}

	private startTurnTimer(gameId: string, game: GameState) {
		this.clearTurnTimer(gameId);

		if (game.status !== 'playing') return;

		const delay = Math.max(0, TURN_TIMEOUT_MS - (Date.now() - game.lastMove));

		const timer = setTimeout(() => {
			this.gameService
				.finalizeTurnTimeout(gameId)
				.then(async (result) => {
					if (result) {
						this.emitGameUpdate(gameId, result);

						if (result.playerProfiles.X?.id) {
							await this.presenceService.emitFriendStatusChange(
								result.playerProfiles.X.id,
							);
						}

						if (result.playerProfiles.O?.id) {
							await this.presenceService.emitFriendStatusChange(
								result.playerProfiles.O.id,
							);
						}
					}
				})
				.finally(() => {
					if (this.turnTimers.get(gameId) === timer) {
						this.turnTimers.delete(gameId);
					}
				})
				.catch((error) => {
					console.error('Turn timeout error:', error);
				});
		}, delay);

		this.turnTimers.set(gameId, timer);
	}

	private getSpectatorsCnt(gameId: string, game: GameState): number {
		const room = this.server.adapter.rooms.get(gameId);
		if (!room) return 0;

		const userIdsInRoom = new Set<number>();

		for (const socketId of room) {
			const socket = this.server.sockets.get(socketId) as
				| AuthSocket
				| undefined;
			const userId = socket?.data.user.sub;
			if (userId) userIdsInRoom.add(userId);
		}

		if (game.players.X.ownerUserId !== null)
			userIdsInRoom.delete(game.players.X.ownerUserId);
		if (game.players.O.ownerUserId !== null)
			userIdsInRoom.delete(game.players.O.ownerUserId);

		return userIdsInRoom.size;
	}

	private cleanupFinishedGameIfEmpty(gameId: string) {
		let game: GameState;

		try {
			game = this.gameService.getGameById(gameId);
		} catch {
			return;
		}

		if (game.status !== 'finished') return;

		const room = this.server.adapter.rooms.get(gameId);
		if (room && room.size > 0) return;

		this.clearTurnTimer(gameId);
		this.gameService.deleteGame(gameId);
	}

	private emitGameUpdate(gameId: string, game: GameState) {
		this.startTurnTimer(gameId, game);

		this.server.to(gameId).emit('game_updated', {
			...game,
			spectatCnt: this.getSpectatorsCnt(gameId, game),
		});
	}

	private emitUpdatedRoles(game: GameState) {
		const socketId_X = game.players.X.socketIds;
		const socketId_O = game.players.O.socketIds;

		if (socketId_X.length > 0)
			this.server.to(socketId_X).emit('role_updated', { role: 'X' });
		if (socketId_O.length > 0)
			this.server.to(socketId_O).emit('role_updated', { role: 'O' });
	}

	handleDisconnect(client: AuthSocket) {
		const result = this.gameService.processPlayerDisconnection(client.id);
		if (result) {
			if (result?.game.status === 'finished')
				result.game.playerLeft = result.role;
			this.emitGameUpdate(result.gameId, result.game);
			this.cleanupFinishedGameIfEmpty(result.gameId);
			return;
		}
		const gameId = client.data.currentGameId;
		if (!gameId) return;

		try {
			const game = this.gameService.getGameById(gameId);
			this.emitGameUpdate(gameId, game);
			this.cleanupFinishedGameIfEmpty(gameId);
		} catch {
			return;
		}
	}

	@SubscribeMessage('join_game')
	async handleJoinGame(
		@MessageBody() body: { gameId: string },
		@ConnectedSocket() client: AuthSocket,
	) {
		try {
			const userId = client.data.user.sub;

			const userProfile = await this.usersService.getUser(userId);

			const { game, role } = this.gameService.joinGame(
				body.gameId,
				client.id,
				userId,
				userProfile,
			);

			await client.join(body.gameId);
			client.data.currentGameId = body.gameId;

			this.emitGameUpdate(body.gameId, game);
			if (game.playerProfiles.X?.id) {
				await this.presenceService.emitFriendStatusChange(
					game.playerProfiles.X.id,
				);
			}

			if (game.playerProfiles.O?.id) {
				await this.presenceService.emitFriendStatusChange(
					game.playerProfiles.O.id,
				);
			}
			client.emit('joined_as', { role });
		} catch (error) {
			client.emit('game_error', {
				message: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	}

	@SubscribeMessage('play_move')
	async handlePlayMove(
		@MessageBody() body: PlayMoveDto,
		@ConnectedSocket() client: AuthSocket,
	) {
		try {
			const userId = client.data.user.sub;
			const newGameState = await this.gameService.playMove(
				body.gameId,
				userId,
				body.r,
				body.c,
			);
			this.emitGameUpdate(body.gameId, newGameState);
			if (newGameState.playerProfiles.X?.id) {
				await this.presenceService.emitFriendStatusChange(
					newGameState.playerProfiles.X.id,
				);
			}

			if (newGameState.playerProfiles.O?.id) {
				await this.presenceService.emitFriendStatusChange(
					newGameState.playerProfiles.O.id,
				);
			}
			return newGameState;
		} catch (error) {
			client.emit('game_error', {
				message: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	}

	@SubscribeMessage('request_replay')
	handleRequestReplay(
		@MessageBody() body: { gameId: string },
		@ConnectedSocket() client: AuthSocket,
	) {
		try {
			const userId = client.data.user.sub;
			const updateGame = this.gameService.requestReplay(body.gameId, userId);

			this.emitUpdatedRoles(updateGame);
			this.emitGameUpdate(body.gameId, updateGame);
			return updateGame;
		} catch (error) {
			client.emit('game_error', {
				message: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	}

	@SubscribeMessage('leave_game')
	async handleLeaveGame(
		@MessageBody() body: { gameId: string },
		@ConnectedSocket() client: AuthSocket,
	) {
		try {
			const userId = client.data.user.sub;
			const result = this.gameService.leaveGame(body.gameId, userId);

			if (result.deleted) {
				await client.leave(body.gameId);
				if (client.data.currentGameId === body.gameId) {
					delete client.data.currentGameId;
					await this.presenceService.emitFriendStatusChange(userId);
				}
				return;
			}
			if (result.game) {
				this.emitGameUpdate(body.gameId, result.game);
				await client.leave(body.gameId);
				if (client.data.currentGameId === body.gameId) {
					delete client.data.currentGameId;
					await this.presenceService.emitFriendStatusChange(userId);
				}
			}
		} catch (error) {
			client.emit('game_error', {
				message: error instanceof Error ? error.message : 'Unknown error',
			});
		}
	}
}
