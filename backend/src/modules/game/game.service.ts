import { Injectable } from '@nestjs/common';
import {
  GameState,
  Move,
  PlayerSymbol,
  CellValue,
  GameStatus,
} from './game.types';
import { checkWinner, initGameState } from './game.logic';

@Injectable()
export class GameService {
  private gameState: GameState = initGameState();
  getGameState(): GameState {
    return { ...this.gameState };
  }
  //const winner = checkWinner(this.gameState.board);
}
