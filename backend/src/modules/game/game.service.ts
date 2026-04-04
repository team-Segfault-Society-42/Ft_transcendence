import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto'; //generer des IDs uniques pour les matchs
import { GameState, PlayerRole } from './game.types';
import {
  initGameState,
  validateToMove,
  applyMove,
  getPlayerRole,
  assignPlayerRole,
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

  joinGame(
    gameId: string,
    clientId: string,
  ): { game: GameState; role: PlayerRole } {
    const game = this.getMutableGameById(gameId);
    const role = assignPlayerRole(game, clientId);
    this.activeGame.set(gameId, game);
    return { game, role };
  }

  playMove(gameId: string, clientId: string, r: number, c: number): GameState {
    const game = this.getMutableGameById(gameId);
    // debug
    console.log('status =', game.status);
    console.log('players =', game.players);
    console.log('clientId =', clientId);
    console.log('role =', getPlayerRole(game, clientId));
    console.log('currentPlayer =', game.currentPlayer);
    //
    if (game.status !== 'playing') throw new Error('Waiting for both players');

    const role = getPlayerRole(game, clientId);
    if (role == 'spectator') throw new Error('Spectators cannot play');
    if (role !== game.currentPlayer) throw new Error('It is not your turn');

    const now = Date.now();
    const timeOnClick = now - game.lastMove;

    // 30 SEC
    if (timeOnClick > 30000) {
      const timeOutWinner = game.currentPlayer === 'X' ? 'O' : 'X';
      game.status = 'finished';
      game.winner = timeOutWinner;
      game.endReason = 'timeout';
      game.scores[timeOutWinner] += 1;
      game.toDisapear = -1;
      game.replayVotes = { X: false, O: false };
      this.activeGame.set(gameId, game);
      return game;
    }

    validateToMove(game, r, c);
    game.lastMove = now;

    const updatState = applyMove(game, r, c);
    this.activeGame.set(gameId, updatState);
    return updatState;
  }
}
