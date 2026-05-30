import { BadRequestException } from '@nestjs/common';
import {
	GameState,
	PlayerSymbol,
	CellValue,
	BoardPosition,
	PlayerRole,
} from './game.types';

export function isCellEmpty(
	gameState: GameState,
	position: BoardPosition,
): boolean {
	return gameState.board[position.r][position.c] === null;
}

/**
 * Creates the default in-memory state for a new game.
 *
 * @returns A waiting game state with an empty board and empty seats.
 */
export function initGameState(): GameState {
	return {
		board: createEmptyBoard(BOARD_SIZE),
		currentPlayer: 'X',
		status: 'waiting',
		winner: null,
		endReason: null,

		moveCount: 0,
		queuIdx: [],
		toDisapear: -1,
		lastMove: Date.now(),
		movesGameHistory: [],
		spectatCnt: 0,
		playerLeft: null,

		players: {
			X: {
				socketIds: [],
				ownerUserId: null,
			},
			O: {
				socketIds: [],
				ownerUserId: null,
			},
		},

		replayVotes: {
			X: false,
			O: false,
		},

		playerProfiles: {
			X: null,
			O: null,
		},
	};
}

export function checkWinner(board: CellValue[][]): PlayerSymbol | null {
	const size = 3;
	for (let r = 0; r < size; r++) {
		if (
			board[r][0] &&
			board[r][0] === board[r][1] &&
			board[r][0] === board[r][2]
		)
			return board[r][0];
	}
	for (let c = 0; c < size; c++) {
		if (
			board[0][c] &&
			board[0][c] === board[1][c] &&
			board[0][c] === board[2][c]
		)
			return board[0][c];
	}
	if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2])
		return board[0][0];
	if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0])
		return board[0][2];
	return null;
}

const maxMoves = 20;

export function checkDraw(countMoves: number): boolean {
	if (countMoves >= maxMoves) return true;
	return false;
}

/**
 * Checks that a move targets a valid empty cell before it is applied.
 *
 * @param gameState - Current game state.
 * @param r - Board row selected by the player.
 * @param c - Board column selected by the player.
 * @throws When the target cell is outside the board or already occupied.
 */
export function validateToMove(gameState: GameState, r: number, c: number) {
	const size = gameState.board.length;
	if (r < 0 || r >= size || c < 0 || c >= size)
		throw new BadRequestException('ERR_GAME_MOVE_COORD_INVALID');
	if (!isCellEmpty(gameState, { r, c })) {
		throw new BadRequestException('ERR_GAME_CELL_OCCUPIED');
	}
}

export const BOARD_SIZE = 3;

export function createEmptyBoard(size: number = BOARD_SIZE): CellValue[][] {
	const board: CellValue[][] = [];

	for (let i = 0; i < size; i++) {
		const row: CellValue[] = [];

		for (let j = 0; j < size; j++) {
			row[j] = null as CellValue;
		}
		board[i] = row;
	}

	return board;
}

/**
 * Applies an accepted move, updates the disappearing-cell rule, and finishes the game if needed.
 *
 * @param game - Current in-memory game state.
 * @param r - Board row selected by the player.
 * @param c - Board column selected by the player.
 * @returns The same game state after applying the move.
 */
export function applyMove(game: GameState, r: number, c: number): GameState {
	const symbol = game.currentPlayer;

	game.board[r][c] = symbol;
	game.moveCount++;
	game.queuIdx.push({ r, c });
	game.movesGameHistory.push(r * 3 + c);

	if (game.queuIdx.length > 6) {
		const oldMove = game.queuIdx.shift();
		if (oldMove) {
			game.board[oldMove.r][oldMove.c] = null;
		}
	}
	if (game.queuIdx.length >= 6) game.toDisapear = posToIdx(game.queuIdx[0]);
	else game.toDisapear = -1;

	const winner = checkWinner(game.board);
	if (winner) {
		game.status = 'finished';
		game.winner = winner;
		game.endReason = 'win';
		game.toDisapear = -1;
		game.replayVotes = { X: false, O: false };
		return game;
	}

	if (checkDraw(game.moveCount)) {
		game.status = 'finished';
		game.endReason = 'draw';
		game.toDisapear = -1;
		game.replayVotes = { X: false, O: false };
		return game;
	}
	game.currentPlayer = symbol === 'X' ? 'O' : 'X';
	return game;
}

/**
 * Keeps a reconnecting user in the same seat; new users fill X, then O, then become spectators.
 *
 * @param game - Current in-memory game state.
 * @param userId - Id of the user joining or reconnecting.
 * @param socketId - Socket id used for this connection.
 * @returns The role assigned to this socket.
 */
export function assignPlayerRole(
	game: GameState,
	userId: number,
	socketId: string,
): PlayerRole {
	if (game.players.X.ownerUserId === userId) {
		game.players.X.socketIds.push(socketId);
		return 'X';
	}
	if (game.players.O.ownerUserId === userId) {
		game.players.O.socketIds.push(socketId);
		return 'O';
	}

	if (game.players.X.ownerUserId === null) {
		game.players.X.ownerUserId = userId;
		game.players.X.socketIds.push(socketId);
		return 'X';
	}
	if (game.players.O.ownerUserId === null) {
		game.players.O.ownerUserId = userId;
		game.players.O.socketIds.push(socketId);
		game.status = 'playing';
		game.currentPlayer = 'X';
		game.lastMove = Date.now();
		return 'O';
	}
	return 'spectator';
}

export function getPlayerRoleByUserId(
	game: GameState,
	userId: number,
): PlayerRole {
	if (game.players.X.ownerUserId === userId) return 'X';
	if (game.players.O.ownerUserId === userId) return 'O';
	return 'spectator';
}

export function getPlayerRoleBySocketId(
	game: GameState,
	socketId: string,
): PlayerRole {
	if (game.players.X.socketIds.includes(socketId)) return 'X';
	if (game.players.O.socketIds.includes(socketId)) return 'O';
	return 'spectator';
}

export function posToIdx(pos: BoardPosition): number {
	return pos.r * 3 + pos.c;
}

/**
 * Starts a replay from a clean board and swaps seats so the previous O player starts as X.
 *
 * @param game - Finished game state that both players agreed to replay.
 * @returns The same game state reset for the replay.
 */
export function resetBoardForReplay(game: GameState): GameState {
	game.board = createEmptyBoard(BOARD_SIZE);
	game.currentPlayer = 'X';
	game.status = 'playing';
	game.winner = null;
	game.endReason = null;

	game.moveCount = 0;
	game.queuIdx = [];
	game.toDisapear = -1;
	game.lastMove = Date.now();
	game.movesGameHistory = [];

	game.replayVotes = {
		X: false,
		O: false,
	};

	swapPlayerRoles(game);
	return game;
}

export function swapPlayerRoles(game: GameState): GameState {
	const oldX = game.players.X;
	const oldProfile = game.playerProfiles.X;

	game.players.X = game.players.O;
	game.playerProfiles.X = game.playerProfiles.O;

	game.players.O = oldX;
	game.playerProfiles.O = oldProfile;

	return game;
}
