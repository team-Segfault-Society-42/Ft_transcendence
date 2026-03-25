import { Injectable } from '@nestjs/common';
import {
  GameState,
  Move,
  PlayerSymbol,
  CellValue,
  GameStatus,
} from './game.types';
import { initGameState } from './game.logic';

@Injectable()
export class GameService {
  private gameState: GameState = initGameState();
  getGameState(): GameState {
    return; //...
  }
}
