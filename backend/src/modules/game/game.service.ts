import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	Inject,
	forwardRef,
	NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
	GameState,
	PlayerRole,
	PlayerSymbol,
	PublicPlayerProfile,
	SocketIds,
} from './game.types';
import { MatchesService } from './matches.service';
import {
	initGameState,
	validateToMove,
	applyMove,
	getPlayerRoleByUserId,
	getPlayerRoleBySocketId,
	assignPlayerRole,
	resetBoardForReplay,
} from './game.logic';
import { PresenceService } from '../../presence/presence.service';

export const TURN_TIMEOUT_MS = 30000;

@Injectable()
export class GameService {
	constructor(
		private readonly matchService: MatchesService,

		@Inject(forwardRef(() => PresenceService))
		private readonly presenceService: PresenceService,
	) {}

	private activeGame = new Map<string, GameState>();

	private getMutableGameById(gameId: string): GameState {
		const game = this.activeGame.get(gameId);
		if (!game) throw new NotFoundException(`Game with ID ${gameId} not found`);
		return game;
	}

	private findActiveGameByUserId(userId: number): [string, GameState] | null {
		for (const [gameId, game] of this.activeGame.entries()) {
			if (game.status === 'finished') continue;

			if (
				game.players.X.ownerUserId === userId ||
				game.players.O.ownerUserId === userId
			) {
				return [gameId, game];
			}
		}

		return null;
	}

	createGame(user: PublicPlayerProfile): string {
		const active = this.findActiveGameByUserId(user.id);
		if (active) throw new ConflictException('ERR_GAME_ALREADY_ACTIVE');
		const gameId = randomUUID();
		const newGame = initGameState();
		newGame.players.X.ownerUserId = user.id;
		newGame.playerProfiles.X = user;
		this.activeGame.set(gameId, newGame);
		this.presenceService.emitActiveGameUpdated(user.id, {
			gameId,
			status: 'waiting',
			playerX: newGame.playerProfiles.X,
		});
		return gameId;
	}

	/*
	 * - !!!return a copy of game
	 */
	getGameById(gameId: string): GameState {
		const game = this.activeGame.get(gameId);
		if (!game) throw new NotFoundException(`Game with ID ${gameId} not found`);
		return structuredClone(game);
	}

	getFinishedGamesHistory(gameId: string) {
		const game = this.getMutableGameById(gameId);

		if (game.status !== 'finished')
			throw new BadRequestException('ERR_GAME_NOT_FINISHED');

		return {
			gameId,
			movesGameHistory: [...game.movesGameHistory],
			winner: game.winner,
			endReason: game.endReason,
		};
	}

	getActiveGameByUserId(userId: number) {
		const active = this.findActiveGameByUserId(userId);
		if (!active) return null;

		const [gameId, game] = active;
		const role = getPlayerRoleByUserId(game, userId);
		const opponent =
			role === 'X' ? game.playerProfiles.O : game.playerProfiles.X;
		return {
			gameId,
			status: game.status,
			role,
			currentPlayer: game.currentPlayer,
			opponent,
			playerX: game.playerProfiles.X,
			playerO: game.playerProfiles.O,
		};
	}

	isUserInGame(userId: number): boolean {
		const active = this.findActiveGameByUserId(userId);

		if (!active) {
			return false;
		}

		const [, game] = active;

		return game.status === 'playing';
	}

	getUserGameActivity(userId: number): 'available' | 'waiting' | 'playing' {
		const active = this.findActiveGameByUserId(userId);

		if (!active) {
			return 'available';
		}

		const [, game] = active;

		if (game.status === 'waiting') {
			return 'waiting';
		}

		if (game.status === 'playing') {
			return 'playing';
		}

		return 'available';
	}

	joinGame(
		gameId: string,
		socketId: string,
		userId: number,
		user?: PublicPlayerProfile,
	): { game: GameState; role: PlayerRole } {
		const game = this.getMutableGameById(gameId);
		const active = this.findActiveGameByUserId(userId);
		if (active && active[0] !== gameId) {
			throw new ConflictException('ERR_GAME_ALREADY_ACTIVE');
		}

		const role = assignPlayerRole(game, userId, socketId);

		if (user && (role === 'X' || role === 'O')) {
			game.playerProfiles[role] = user;
		}

		this.activeGame.set(gameId, game);

		if (game.status === 'playing') {
			const payload = {
				gameId,
				status: game.status,
				playerX: game.playerProfiles.X!,
				playerO: game.playerProfiles.O!,
			};

			if (game.playerProfiles.X?.id) {
				this.presenceService.emitActiveGameUpdated(
					game.playerProfiles.X.id,
					payload,
				);
			}

			if (game.playerProfiles.O?.id) {
				this.presenceService.emitActiveGameUpdated(
					game.playerProfiles.O.id,
					payload,
				);
			}
		}
		return { game, role };
	}

	requestReplay(gameId: string, userId: number): GameState {
		const game = this.getMutableGameById(gameId);

		if (game.status !== 'finished')
			throw new BadRequestException('ERR_GAME_REPLAY_NOT_AVAILABLE');

		const role = getPlayerRoleByUserId(game, userId);

		if (role !== 'X' && role !== 'O')
			throw new ForbiddenException('ERR_GAME_SPECTATOR_REPLAY');

		game.replayVotes[role] = true;

		if (game.replayVotes.X && game.replayVotes.O) resetBoardForReplay(game);

		this.activeGame.set(gameId, game);
		return game;
	}

	async playMove(
		gameId: string,
		userId: number,
		r: number,
		c: number,
	): Promise<GameState> {
		const game = this.getMutableGameById(gameId);
		if (game.status !== 'playing')
			throw new BadRequestException('ERR_GAME_WAITING_PLAYERS');

		const role = getPlayerRoleByUserId(game, userId);
		if (role === 'spectator')
			throw new ForbiddenException('ERR_GAME_SPECTATOR_MOVE');
		if (role !== game.currentPlayer)
			throw new BadRequestException('ERR_GAME_NOT_YOUR_TURN');

		const now = Date.now();
		const timeOnClick = now - game.lastMove;

		// 30 SEC
		if (timeOnClick > TURN_TIMEOUT_MS) {
			const timeOutGame = await this.finalizeTurnTimeout(gameId);
			if (timeOutGame) return timeOutGame;
		}

		validateToMove(game, r, c);
		game.lastMove = now;

		const updatState = applyMove(game, r, c);

		if (updatState.status === 'finished') {
			await this.saveGameToDB(updatState);

			if (updatState.playerProfiles.X?.id) {
				this.presenceService.emitActiveGameUpdated(
					updatState.playerProfiles.X.id,
					null,
				);
			}

			if (updatState.playerProfiles.O?.id) {
				this.presenceService.emitActiveGameUpdated(
					updatState.playerProfiles.O.id,
					null,
				);
			}
		}
		this.activeGame.set(gameId, updatState);
		return updatState;
	}

	processPlayerDisconnection(
		socketId: string,
	): { gameId: string; role: 'X' | 'O'; game: GameState } | null {
		for (const [gameId, game] of this.activeGame.entries()) {
			const role = getPlayerRoleBySocketId(game, socketId);
			if (role === 'spectator') continue;

			game.players[role].socketIds = game.players[role].socketIds.filter(
				(id) => id !== socketId,
			);

			this.activeGame.set(gameId, game);

			if (game.players[role].socketIds.length > 0) {
				return null;
			}

			return { gameId, role, game };
		}

		return null;
	}

	deleteGame(gameId: string): boolean {
		return this.activeGame.delete(gameId);
	}

	private async saveGameToDB(game: GameState) {
		if (!game.playerProfiles.X || !game.playerProfiles.O) return;

		const data = {
			player1Id: game.playerProfiles.X.id,
			player2Id: game.playerProfiles.O.id,
			scoresP1: game.winner === 'X' ? 1 : 0,
			scoresP2: game.winner === 'O' ? 1 : 0,
			winnerId:
				game.winner === 'X'
					? game.playerProfiles.X?.id
					: game.winner === 'O'
						? game.playerProfiles.O?.id
						: undefined,
			endReason: game.endReason,
		};

		await this.matchService.recordMatch(data, game.movesGameHistory);
	}

	async finalizeReconnectTimeout(
		gameId: string,
		role: PlayerSymbol,
	): Promise<{ gameId: string; game: GameState } | null> {
		const game = this.getMutableGameById(gameId);

		const seat = game.players[role];
		if (seat.socketIds.length > 0) return null;
		if (game.status !== 'playing') return null;

		const other = role === 'X' ? 'O' : 'X';
		if (game.players[other].ownerUserId === null) return null;
		if (game.players[other].socketIds.length == 0) return null;

		game.status = 'finished';
		game.winner = other;
		game.endReason = 'forfeit';
		game.toDisapear = -1;
		game.replayVotes = { X: false, O: false };

		await this.saveGameToDB(game);
		this.activeGame.set(gameId, game);

		if (game.playerProfiles.X?.id) {
			this.presenceService.emitActiveGameUpdated(
				game.playerProfiles.X.id,
				null,
			);
		}

		if (game.playerProfiles.O?.id) {
			this.presenceService.emitActiveGameUpdated(
				game.playerProfiles.O.id,
				null,
			);
		}

		return { gameId, game };
	}

	async finalizeTurnTimeout(gameId: string): Promise<GameState | null> {
		const game = this.getMutableGameById(gameId);
		if (game.status !== 'playing') return null;

		const elapsedTime = Date.now() - game.lastMove;
		if (elapsedTime < TURN_TIMEOUT_MS) return null;

		const timeOutWinner = game.currentPlayer === 'X' ? 'O' : 'X';

		game.status = 'finished';
		game.winner = timeOutWinner;
		game.endReason = 'timeout';
		game.toDisapear = -1;
		game.replayVotes = { X: false, O: false };

		await this.saveGameToDB(game);
		this.activeGame.set(gameId, game);

		if (game.playerProfiles.X?.id) {
			this.presenceService.emitActiveGameUpdated(
				game.playerProfiles.X.id,
				null,
			);
		}

		if (game.playerProfiles.O?.id) {
			this.presenceService.emitActiveGameUpdated(
				game.playerProfiles.O.id,
				null,
			);
		}

		return game;
	}

	setPlayerLeft(gameId: string, userId: number): GameState {
		const game = this.getMutableGameById(gameId);
		const role = getPlayerRoleByUserId(game, userId);
		if (role === 'X' || role === 'O') game.playerLeft = role;
		this.activeGame.set(gameId, game);
		return game;
	}

	getLiveGames(userId: number) {
		const waiting: { gameId: string; playerX: PublicPlayerProfile | null }[] =
			[];
		const playing: {
			gameId: string;
			playerX: PublicPlayerProfile | null;
			playerO: PublicPlayerProfile | null;
		}[] = [];
		const allGames = [...this.activeGame.entries()];
		for (const [gameId, game] of allGames) {
			if (game.status === 'waiting' && game.players.X.ownerUserId !== userId)
				waiting.push({ gameId, playerX: game.playerProfiles.X });
			else if (
				game.status === 'playing' &&
				game.players.X.ownerUserId !== userId &&
				game.players.O.ownerUserId !== userId
			)
				playing.push({
					gameId,
					playerX: game.playerProfiles.X,
					playerO: game.playerProfiles.O,
				});
		}
		return { waiting, playing };
	}

	leaveGame(
		gameId: string,
		userId: number,
	): { deleted: boolean; game: GameState | null } {
		const game = this.getMutableGameById(gameId);
		const role = getPlayerRoleByUserId(game, userId);

		if (game.status === 'waiting' && role === 'X') {
			this.activeGame.delete(gameId);
			this.presenceService.emitActiveGameUpdated(userId, null);
			return { deleted: true, game: null };
		}

		if (game.status === 'playing') {
			throw new BadRequestException('ERR_GAME_CANT_LEAVE_PLAYING');
		}

		if (role === 'X' || role === 'O') game.playerLeft = role;

		this.activeGame.set(gameId, game);
		return { deleted: false, game };
	}
}
