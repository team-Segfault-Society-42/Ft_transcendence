import { Injectable } from '@nestjs/common';
import {
  GameState,
  Move,
  PlayerSymbol,
  CellValue,
  GameStatus,
} from './game.types';

@Injectable()
export class GameService {
  private gameState: GameState = {
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
  };
}
