import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto'; //generer des IDs uniques pour les matchs
import { GameState, PlayerRole, PublicPlayerProfile } from './game.types';
import { MatchesService } from './matches.service';
import {
  initGameState,
  validateToMove,
  applyMove,
  getPlayerRole,
  assignPlayerRole,
  resetBoardForReplay,
} from './game.logic';
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
    clientId: string,
    user?: PublicPlayerProfile,
  ): { game: GameState; role: PlayerRole } {
    const game = this.getMutableGameById(gameId);
    const role = assignPlayerRole(game, clientId);

    if (user && (role === 'X' || role === 'O')) {
      game.playerProfiles[role] = user;
    }

    this.activeGame.set(gameId, game);
    return { game, role };
  }

  requestReplay(gameId: string, clientId: string): GameState {
    const game = this.getMutableGameById(gameId);

    if (game.status !== 'finished')
      throw new Error('Replay is only available after game end');

    const role = getPlayerRole(game, clientId);

    if (role !== 'X' && role !== 'O')
      throw new Error('Spectators cannot request replay');

    game.replayVotes[role] = true;

    if (game.replayVotes.X && game.replayVotes.O) resetBoardForReplay(game);

    this.activeGame.set(gameId, game);
    return game;
  }

  async playMove(gameId: string, clientId: string, r: number, c: number): Promise<GameState> {
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
      await this.saveGameToDB(game)
      game.replayVotes = { X: false, O: false };
      this.activeGame.set(gameId, game);
      return game;
    }

    validateToMove(game, r, c);
    game.lastMove = now;

    const updatState = applyMove(game, r, c);

    if (updatState.status === 'finished'){
      await this.saveGameToDB(updatState)
    }

    this.activeGame.set(gameId, updatState);
    return updatState;
  }

  async processPlayerDisconnection(
    clientId: string,
  ): Promise<{ gameId: string; game: GameState } | null> {
    for (const [gameId, game] of this.activeGame.entries()) {
      const wasX = game.players.X === clientId;
      const wasO = game.players.O === clientId;

      if (!wasX && !wasO) continue;

      const role = wasX ? 'X' : 'O';
      const other = role === 'X' ? 'O' : 'X';

      game.players[role] = null;
      game.playerProfiles[role] = null;

      if (game.status === 'playing' && game.players[other]) {
        game.status = 'finished';
        game.winner = other;
        game.endReason = 'forfeit';
        game.scores[other] += 1;
        game.toDisapear = -1;
        await this.saveGameToDB(game)
        game.replayVotes = { X: false, O: false };
      }

      if (game.status === 'waiting') {
        game.winner = null;
        game.endReason = null;
      }
      this.activeGame.set(gameId, game);
      return { gameId, game };
    }

    return null;
  }

private async saveGameToDB(game: GameState) {
  if (!game.playerProfiles.X || !game.playerProfiles.O) return

  const data = {
  player1Id: game.playerProfiles.X.id,
  player2Id: game.playerProfiles.O.id,
  scoresP1: game.scores.X,
  scoresP2: game.scores.O,
  winnerId: (game.winner === 'X') ? game.playerProfiles.X?.id : (game.winner === 'O') ? game.playerProfiles.O?.id : undefined,
  endReason: game.endReason
  }

  await this.matchService.recordMatch(data, game.movesGameHistory)
  console.log("Save to DB successful")
}

}
