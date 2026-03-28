import { count } from 'console';
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
    startTime: Date.now(),
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

const maxTime = 5 * 60 * 1000; // 5 min
const maxMoves = 100;

export function checkDraw(countMoves: number, startTime: number): boolean {
  if (countMoves >= maxMoves || Date.now() - startTime > maxTime) return true;
  return false;
}
