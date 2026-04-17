import {
  GameState,
  Move,
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

export function initGameState(): GameState {
  return {
    board: createEmptyBoard(BOARD_SIZE),
    currentPlayer: 'X', // 1st to log take X
    status: 'waiting',
    winner: null,
    endReason: null,

    moveCount: 0,
    queuIdx: [],
    toDisapear: -1,
    lastMove: Date.now(),
    movesGameHistory: [],

    players: {
      X: { ownerUserId: null, socketId: null },
      O: { ownerUserId: null, socketId: null },
    },

    scores: {
      X: 0,
      O: 0,
      D: 0,
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

// 	queue,
// 	idx,
// 	history,
// 	scores,
// 	resetSession,
// 	replayGame,

// const toDisapear = idx > 5 ? queue[idx % 6] : -1

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

export function validateToMove(gameState: GameState, r: number, c: number) {
  const size = gameState.board.length;
  if (r < 0 || r >= size || c < 0 || c >= size)
    throw new Error(`move out of range: cell ${r},${c} dosen't existe`);
  if (!isCellEmpty(gameState, { r, c })) {
    throw new Error(`This cell ${r},${c} is already occupied`);
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

export function applyMove(game: GameState, r: number, c: number): GameState {
  const symbol = game.currentPlayer;

  game.board[r][c] = symbol;
  game.moveCount++;
  game.queuIdx.push({ r, c });
  game.movesGameHistory.push(r * 3 + c);
  // DEBUG : state before add
  console.log('--- QUEUE APRES AJOUT ---');
  console.table(game.queuIdx);

  if (game.queuIdx.length > 6) {
    const oldMove = game.queuIdx.shift();
    if (oldMove) {
      game.board[oldMove.r][oldMove.c] = null;
      // DEBUG : state after delete
      console.log(`[SHIFT] Supprimé du board : [${oldMove.r},${oldMove.c}]`);
      console.log('--- QUEUE APRES SHIFT ---');
      console.table(game.queuIdx);
    }
  }
  if (game.queuIdx.length >= 6) game.toDisapear = posToIdx(game.queuIdx[0]);
  else game.toDisapear = -1;

  const winner = checkWinner(game.board);
  if (winner) {
    console.log('winner is : ' + winner);
    game.status = 'finished';
    game.winner = winner;
    game.endReason = 'win';
    game.scores[winner] += 1;
    game.toDisapear = -1;
    game.replayVotes = { X: false, O: false };
    return game;
  }

  if (checkDraw(game.moveCount)) {
    console.log('Its a Draw ');
    game.status = 'finished';
    game.endReason = 'draw';
    game.scores.D += 1;
    game.toDisapear = -1;
    game.replayVotes = { X: false, O: false };
    return game;
  }
  game.currentPlayer = symbol === 'X' ? 'O' : 'X';
  return game;
}

/**
 * (SETTER)
 * Assign a role to the client
 * - 1st client: X
 * - 2nd client: O (starts the game)
 * - others: spectator
 * @param game - The game state
 * @param socketId - The client identifier
 * @return PlayerRole The assigned player role
 */
export function assignPlayerRole(
  game: GameState,
  socketId: string,
): PlayerRole {
  if (game.players.X === socketId) return 'X';
  if (game.players.O === socketId) return 'O';

  if (!game.players.X) {
    game.players.X = socketId;
    return 'X';
  }
  if (!game.players.O) {
    game.players.O = socketId;
    game.status = 'playing';
    game.currentPlayer = 'X';
    game.lastMove = Date.now();
    return 'O';
  }
  return 'spectator';
}

/**
 * (GETTER)
 * Get the player role for a client
 * @param game - The game state
 * @param socketId - The client identifier
 * @return PlayerRole The player role
 */
export function getPlayerRole(game: GameState, socketId: string): PlayerRole {
  if (game.players.X == socketId) return 'X';
  if (game.players.O == socketId) return 'O';
  return 'spectator';
}

export function posToIdx(pos: BoardPosition): number {
  return pos.r * 3 + pos.c;
}

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

  return game;
}
