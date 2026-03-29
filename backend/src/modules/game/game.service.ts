import { Injectable } from '@nestjs/common';
import {
  GameState,
  Move,
  PlayerSymbol,
  CellValue,
  GameStatus,
  BoardPosition,
} from './game.types';
import {
  checkDraw,
  checkWinner,
  initGameState,
  isCellEmpty,
  validateToMove,
  applyMove,
} from './game.logic';
@Injectable()
export class GameService {
  private gameState: GameState = initGameState();
  getGameState(): GameState {
    return { ...this.gameState };
  }
  // maybe prepare more for 6x6 , 7x7 or 9x9

  playMove(r: number, c: number): void {
    if (this.gameState.status === 'finished')
      throw new Error("you Can't Play, Party is finished");

    const now = Date.now();
    const timeOnClick = now - this.gameState.lastMove;

    // 30 SEC
    if (timeOnClick > 30000) {
      this.gameState.status = 'finished';
      this.gameState.winner = this.gameState.currentPlayer === 'X' ? 'O' : 'X';
      return;
    }

    validateToMove(this.gameState, r, c);
    this.gameState.lastMove = now;

    this.gameState = applyMove(this.gameState, r, c);
  }
}
