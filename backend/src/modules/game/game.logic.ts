import {
  GameState,
  Move,
  PlayerSymbol,
  CellValue,
  BoardPosition,
} from './game.types';

export function isCellEmpty(
  gameState: GameState,
  position: BoardPosition,
): boolean {
  return gameState.board[position.r][position.c] === null;
}

export function initGameState(): GameState {
  return {
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    moveCount: 0,
    queuIdx: [],
    toDisapear: -1,
    lastMove: Date.now(),
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

const maxMoves = 50;

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
