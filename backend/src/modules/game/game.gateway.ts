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
@UseGuards(JwtAuthGuard)
export class GameGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server!: Namespace;

	private turnTimers = new Map<string, NodeJS.Timeout>();

	constructor(
		private readonly gameService: GameService,
		private readonly usersService: UsersService,
		private readonly presenceService: PresenceService,
	) {}

	private emitGameError(client: AuthSocket, error: unknown) {
		const code =
			error instanceof Error && error.message.startsWith('ERR_')
				? error.message
				: 'ERR_GAME_UNKNOWN';

		client.emit('game_error', { code });
	}

	/**
	 * Clears the stored turn timer for a game if one exists.
	 *
	 * @param gameId - Id of the game linked to the timer.
	 */
	private clearTurnTimer(gameId: string) {
		const timer = this.turnTimers.get(gameId);

		if (timer) {
			clearTimeout(timer);
			this.turnTimers.delete(gameId);
		}
	}

	/**
	 * Starts the backend turn timer for a playing game.
	 * Frontend countdowns only mirror this server-side timestamp.
	 *
	 * @param gameId - Id of the game to time.
	 * @param game - Current game state used to compute the remaining delay.
	 */
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

	/**
	 * Counts unique spectators currently connected to a game room.
	 *
	 * @param gameId - Id of the Socket.IO room.
	 * @param game - Current game state used to exclude player seats.
	 * @returns Number of unique connected users who are not players.
	 */
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

	/**
	 * Deletes a finished game when no socket is still connected to its room.
	 *
	 * @param gameId - Id of the game to clean up.
	 */
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

	/**
	 * Sends the latest game state to every socket in the game room.
	 * The spectator count is computed from connected sockets at emit time.
	 *
	 * @param gameId - Id of the game room.
	 * @param game - Game state to broadcast.
	 */
	private emitGameUpdate(gameId: string, game: GameState) {
		this.startTurnTimer(gameId, game);

		this.server.to(gameId).emit('game_updated', {
			...game,
			spectatCnt: this.getSpectatorsCnt(gameId, game),
		});
	}

	/**
	 * Sends the current X/O roles to player sockets after replay votes may swap seats.
	 *
	 * @param game - Game state containing the current player socket ids.
	 */
	private emitUpdatedRoles(game: GameState) {
		const socketId_X = game.players.X.socketIds;
		const socketId_O = game.players.O.socketIds;

		if (socketId_X.length > 0)
			this.server.to(socketId_X).emit('role_updated', { role: 'X' });
		if (socketId_O.length > 0)
			this.server.to(socketId_O).emit('role_updated', { role: 'O' });
	}

	/**
	 * Handles player and spectator disconnections from a game socket.
	 *
	 * @param client - Authenticated socket that disconnected.
	 */
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

	/**
	 * Joins the authenticated user to a game room and broadcasts the updated state.
	 *
	 * @param body - Payload containing the game id to join.
	 * @param client - Authenticated socket joining the game.
	 */
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
		} catch (error: unknown) {
			this.emitGameError(client, error);
		}
	}

	/**
	 * Applies a move from the authenticated player and broadcasts the new game state.
	 *
	 * @param body - Move payload containing the game id and board coordinates.
	 * @param client - Authenticated socket sending the move.
	 * @returns The updated game state when the move is accepted.
	 */
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
		} catch (error: unknown) {
			this.emitGameError(client, error);
		}
	}

	/**
	 * Registers a replay vote for the authenticated player.
	 *
	 * @param body - Payload containing the game id.
	 * @param client - Authenticated socket requesting the replay.
	 * @returns The updated game state after the replay vote.
	 */
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
		} catch (error: unknown) {
			this.emitGameError(client, error);
		}
	}

	/**
	 * Removes the authenticated user from the game and updates the room state.
	 *
	 * @param body - Payload containing the game id to leave.
	 * @param client - Authenticated socket leaving the game.
	 */
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
		} catch (error: unknown) {
			this.emitGameError(client, error);
		}
	}
}
