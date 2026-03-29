import { Test } from '@nestjs/testing';
import { checkWinner } from './game.logic';
import { CellValue } from './game.types';
import { GameService } from './game.service';

/*fichier pour DEBUG LA GAME ET LES STEPS */

describe('Game Engine Tests', () => {
  let service: GameService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = moduleRef.get<GameService>(GameService);
  });

  const logState = (label: string) => {
    const state = service.getGameState();

    console.log(
      `${label} | moveCount=${state.moveCount} | currentPlayer=${state.currentPlayer} | status=${state.status} | winner=${state.winner}`,
    );
    console.log('board:', JSON.stringify(state.board));
  };

  it('handles a long sequence of moves without early win', () => {
    service.playMove(0, 0);
    service.playMove(0, 1);
    service.playMove(0, 2);
    service.playMove(1, 0);
    service.playMove(1, 1);
    service.playMove(1, 2);
    logState('after 6 moves');

    service.playMove(2, 1);
    logState('after move 7');

    const stateAfter7 = service.getGameState();
    expect(stateAfter7.board[0][0]).toBeNull();
    expect(stateAfter7.queuIdx.length).toBe(6);

    service.playMove(2, 0);
    logState('after move 8');

    const stateAfter8 = service.getGameState();
    expect(stateAfter8.board[0][1]).toBeNull();
    expect(stateAfter8.status).toBe('playing');
    expect(stateAfter8.moveCount).toBe(8);
    expect(stateAfter8.queuIdx.length).toBe(6);
  });

  it('detects a horizontal win for X', () => {
    const board: CellValue[][] = [
      ['X', 'X', 'X'],
      [null, null, null],
      [null, null, null],
    ];

    console.log('horizontal win:', checkWinner(board));
    expect(checkWinner(board)).toBe('X');
  });

  it('detects a diagonal win for X', () => {
    const board: CellValue[][] = [
      ['X', null, null],
      [null, 'X', null],
      [null, null, 'X'],
    ];

    console.log('diagonal win:', checkWinner(board));
    expect(checkWinner(board)).toBe('X');
  });
});
