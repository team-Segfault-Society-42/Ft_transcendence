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
} from './game.logic';

@Injectable()
export class GameService {
  private gameState: GameState = initGameState();
  getGameState(): GameState {
    return { ...this.gameState };
  }
  // maybe more for 6x6 , 7x7 or 9x9

  playMove(r: number, c: number): void {
    if (this.gameState.status === 'finished') return;
    if (isCellEmpty(this.gameState, { r, c })) return;

    const symbol = this.gameState.currentPlayer;
    this.gameState.board[r][c] = symbol;
    this.gameState.moveCount++;

    const winner = checkWinner(this.gameState.board);
    if (winner) {
      console.log('winner is : ' + winner);
      this.gameState.status = 'finished';
      this.gameState.winner = winner;
      return;
    }

    const isDraw = checkDraw(
      this.gameState.moveCount,
      this.gameState.startTime,
    );
    if (isDraw) {
      console.log('Its a Draw ');
      this.gameState.status = 'finished';
      return;
    }
    this.gameState.currentPlayer = symbol === 'X' ? 'O' : 'X';
  }
}
