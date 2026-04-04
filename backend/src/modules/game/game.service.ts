import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto'; //generer des IDs uniques pour les matchs
import { GameState } from './game.types';
import { initGameState, validateToMove, applyMove } from './game.logic';
@Injectable()
export class GameService {
  private activeGame = new Map<string, GameState>();

  private getMutableGameById(gameId: string): GameState {
    const game = this.activeGame.get(gameId);
    if (!game) throw new Error(`Game with ID ${gameId} not found`);
    return game;
  }

  creatGame(): string {
    const gameId = randomUUID();
    const newGame = initGameState();
    this.activeGame.set(gameId, newGame);
    return gameId;
  }

  /*
   * - !!!return a copy of game
   */
  getGameById(gameId: string): GameState {
    const game = this.activeGame.get(gameId);
    if (!game) throw new Error(`Game with ID ${gameId} not found`);
    return { ...game };
  }
  // maybe prepare more for 6x6 , 7x7 or 9x9

  playMove(gameId: string, clientId: string, r: number, c: number): GameState {
    const gameState = this.getMutableGameById(gameId);
    if (gameState.status === 'finished')
      throw new Error("you Can't Play, Party is finished");

    const now = Date.now();
    const timeOnClick = now - gameState.lastMove;

    // 30 SEC
    if (timeOnClick > 30000) {
      gameState.status = 'finished';
      gameState.winner = gameState.currentPlayer === 'X' ? 'O' : 'X';
      return gameState;
    }

    validateToMove(gameState, r, c);
    gameState.lastMove = now;

    const updatState = applyMove(gameState, r, c);
    this.activeGame.set(gameId, updatState);
    return updatState;
  }
}
