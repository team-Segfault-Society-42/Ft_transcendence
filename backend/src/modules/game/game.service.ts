import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto'; //generer des IDs uniques pour les matchs
import { GameState, PlayerRole, PublicPlayerProfile } from './game.types';
import { MatchesService } from './matches.service';
import {
  initGameState,
  validateToMove,
  applyMove,
  getPlayerRoleByUserId,
  getPlayerRoleBySocketId,
  assignPlayerRole,
  resetBoardForReplay,
} from './game.logic';

export const TURN_TIMEOUT_MS = 30000;

@Injectable()
export class GameService {
  constructor(private readonly matchService: MatchesService) {}

  private activeGame = new Map<string, GameState>();

  private getMutableGameById(gameId: string): GameState {
    const game = this.activeGame.get(gameId);
    if (!game) throw new NotFoundException(`Game with ID ${gameId} not found`);
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
    if (!game) throw new NotFoundException(`Game with ID ${gameId} not found`);
    return structuredClone(game);
  }

  getFinishedGamesHistory(gameId: string) {
    const game = this.getMutableGameById(gameId);

    if (game.status !== 'finished') throw new Error('Game not finished yet');

    return {
      gameId,
      movesGameHistory: [...game.movesGameHistory],
      winner: game.winner,
      endReason: game.endReason,
    };
  }

  joinGame(
    gameId: string,
    socketId: string,
    userId: number,
    user?: PublicPlayerProfile,
  ): { game: GameState; role: PlayerRole } {
    const game = this.getMutableGameById(gameId);

    const role = assignPlayerRole(game, userId, socketId);

    if (user && (role === 'X' || role === 'O')) {
      game.playerProfiles[role] = user;
    }

    this.activeGame.set(gameId, game);
    return { game, role };
  }

  requestReplay(gameId: string, userId: number): GameState {
    const game = this.getMutableGameById(gameId);

    if (game.status !== 'finished')
      throw new Error('Replay is only available after game end');

    const role = getPlayerRoleByUserId(game, userId);

    if (role !== 'X' && role !== 'O')
      throw new Error('Spectators cannot request replay');

    game.replayVotes[role] = true;

    if (game.replayVotes.X && game.replayVotes.O) resetBoardForReplay(game);

    this.activeGame.set(gameId, game);
    return game;
  }

  async playMove(
    gameId: string,
    userId: number,
    r: number,
    c: number,
  ): Promise<GameState> {
    const game = this.getMutableGameById(gameId);
    // debug
    console.log('status =', game.status);
    console.log('players =', game.players);
    console.log('userId =', userId);
    console.log('role =', getPlayerRoleByUserId(game, userId));
    console.log('currentPlayer =', game.currentPlayer);
    //
    if (game.status !== 'playing') throw new Error('Waiting for both players');

    const role = getPlayerRoleByUserId(game, userId);
    if (role === 'spectator') throw new Error('Spectators cannot play');
    if (role !== game.currentPlayer) throw new Error('It is not your turn');

    const now = Date.now();
    const timeOnClick = now - game.lastMove;

    // 30 SEC
    if (timeOnClick > TURN_TIMEOUT_MS) {
      const timeOutGame = await this.finalizeTurnTimeout(gameId);
      if (timeOutGame) return timeOutGame;
    }

    validateToMove(game, r, c);
    game.lastMove = now;

    const updatState = applyMove(game, r, c);

    if (updatState.status === 'finished') {
      await this.saveGameToDB(updatState);
    }

    this.activeGame.set(gameId, updatState);
    return updatState;
  }

  processPlayerDisconnection(
    socketId: string,
  ): { gameId: string; role: 'X' | 'O'; game: GameState } | null {
    for (const [gameId, game] of this.activeGame.entries()) {
      const role = getPlayerRoleBySocketId(game, socketId);
      if (role === 'spectator') continue;

      game.players[role].socketId = null;
      this.activeGame.set(gameId, game);
      return { gameId, role, game };
    }

    return null;
  }

  deleteGame(gameId: string): boolean {
    return this.activeGame.delete(gameId);
  }

  private async saveGameToDB(game: GameState) {
    if (!game.playerProfiles.X || !game.playerProfiles.O) return;

    const data = {
      player1Id: game.playerProfiles.X.id,
      player2Id: game.playerProfiles.O.id,
      scoresP1: game.winner === 'X' ? 1 : 0,
      scoresP2: game.winner === 'O' ? 1 : 0,
      winnerId:
        game.winner === 'X'
          ? game.playerProfiles.X?.id
          : game.winner === 'O'
            ? game.playerProfiles.O?.id
            : undefined,
      endReason: game.endReason,
    };

    await this.matchService.recordMatch(data, game.movesGameHistory);
    console.log('Save to DB successful');
  }

  async finalizeReconnectTimeout(
    gameId: string,
    role: 'X' | 'O',
  ): Promise<{ gameId: string; game: GameState } | null> {
    const game = this.getMutableGameById(gameId);

    const seat = game.players[role];
    if (seat.socketId != null) return null;
    if (game.status !== 'playing') return null;

    const other = role === 'X' ? 'O' : 'X';
    if (game.players[other].ownerUserId === null) return null;
    if (game.players[other].socketId == null) return null;
    // if other player is not online maybe return state cancelled in the future

    console.log(`[RECONNECT] finalize forfeit for ${role} in game ${gameId}`);

    game.status = 'finished';
    game.winner = other;
    game.endReason = 'forfeit';
    game.scores[other] += 1;
    game.toDisapear = -1;
    game.replayVotes = { X: false, O: false };

    await this.saveGameToDB(game);
    this.activeGame.set(gameId, game);
    return { gameId, game };
  }

  async finalizeTurnTimeout(gameId: string): Promise<GameState | null> {
    const game = this.getMutableGameById(gameId);
    if (game.status !== 'playing') return null;

    const elapsedTime = Date.now() - game.lastMove;
    if (elapsedTime < TURN_TIMEOUT_MS) return null;

    const timeOutWinner = game.currentPlayer === 'X' ? 'O' : 'X';

    game.status = 'finished';
    game.winner = timeOutWinner;
    game.endReason = 'timeout';
    game.scores[timeOutWinner] += 1;
    game.toDisapear = -1;
    game.replayVotes = { X: false, O: false };

    await this.saveGameToDB(game);
    this.activeGame.set(gameId, game);
    return game;
  }

  setPlayerLeft(gameId: string, userId: number): GameState {
    const game = this.getMutableGameById(gameId);
    const role = getPlayerRoleByUserId(game, userId);
    if (role === 'X' || role === 'O') game.playerLeft = role;
    this.activeGame.set(gameId, game);
    return game;
  }

  getLiveGames() {
    const waiting: GameState[] = [];
    const playing: GameState[] = [];
    const allGames = [...this.activeGame.values()];
    for (const game of allGames) {
      if (game.status === 'waiting') waiting.push(game);
      else if (game.status === 'playing') playing.push(game);
    }
    return { waiting, playing };
  }
}
