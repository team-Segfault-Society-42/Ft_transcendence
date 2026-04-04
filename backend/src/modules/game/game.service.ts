import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto'; //generer des IDs uniques pour les matchs
import { GameState } from './game.types';
import {
  initGameState,
  validateToMove,
  applyMove,
  getPlayerRole,
} from './game.logic';
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
    const game = this.getMutableGameById(gameId);
    if (game.status === 'finished')
      throw new Error('Game is not in playing state');

    const role = getPlayerRole(game, clientId);
    if (game.status !== 'playing')
      throw new Error("you Can't Play, Party is finished");
    if (role == 'spectator') throw new Error('Spectators cannot play');
    if (role !== game.currentPlayer) throw new Error('It is not your turn');

    const now = Date.now();
    const timeOnClick = now - game.lastMove;

    // 30 SEC
    if (timeOnClick > 30000) {
      game.status = 'finished';
      game.winner = game.currentPlayer === 'X' ? 'O' : 'X';
      return game;
    }

    validateToMove(game, r, c);
    game.lastMove = now;

    const updatState = applyMove(game, r, c);
    this.activeGame.set(gameId, updatState);
    return updatState;
  }
}
