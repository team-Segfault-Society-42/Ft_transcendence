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
    if (!isCellEmpty(this.gameState, { r, c })) return;

    const now = Date.now();
    const timeOnClick = now - this.gameState.lastMove;
    const symbol = this.gameState.currentPlayer;
    // 30 SEC
    if (timeOnClick > 30000) {
      this.gameState.status = 'finished';
      this.gameState.winner = symbol === 'X' ? 'O' : 'X';
      return;
    }

    this.gameState.board[r][c] = symbol;
    this.gameState.moveCount++;
    this.gameState.queuIdx.push({ r, c });
    // DEBUG : state before add
    console.log('--- QUEUE APRES AJOUT ---');
    console.table(this.gameState.queuIdx);

    if (this.gameState.queuIdx.length > 6) {
      const oldMove = this.gameState.queuIdx.shift();
      if (oldMove) {
        this.gameState.board[oldMove.r][oldMove.c] = null;
        // DEBUG : state after delete
        console.log(`[SHIFT] Supprimé du board : [${oldMove.r},${oldMove.c}]`);
        console.log('--- QUEUE APRES SHIFT ---');
        console.table(this.gameState.queuIdx);
      }
    }
    if (this.gameState.queuIdx.length >= 6) {
      const nextToDie = this.gameState.queuIdx[0];
      console.log(
        'for frontend => next to die ' + nextToDie.r + ' ' + nextToDie.c,
      );
    }

    const winner = checkWinner(this.gameState.board);
    if (winner) {
      console.log('winner is : ' + winner);
      this.gameState.status = 'finished';
      this.gameState.winner = winner;
      return;
    }

    const isDraw = checkDraw(this.gameState.moveCount);
    if (isDraw) {
      console.log('Its a Draw ');
      this.gameState.status = 'finished';
      return;
    }
    this.gameState.currentPlayer = symbol === 'X' ? 'O' : 'X';
  }
}
