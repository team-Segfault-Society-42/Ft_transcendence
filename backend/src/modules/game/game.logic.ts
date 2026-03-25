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
