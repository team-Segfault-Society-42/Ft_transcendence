import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { MatchesService } from './matches.service';

/*fichier pour DEBUG LA GAME ET LES STEPS */

describe('Game Engine Tests', () => {
  let service: GameService;
  let moduleRef: TestingModule;
  let gameId: string;
  const playerX = { userId: 1, socketId: 'socket-x' };
  const playerO = { userId: 2, socketId: 'socket-o' };
  const matchesServiceMock = {
    recordMatch: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        GameService,
        {
          provide: MatchesService,
          useValue: matchesServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<GameService>(GameService);
    gameId = service.createGame();
    service.joinGame(gameId, playerX.socketId, playerX.userId);
    service.joinGame(gameId, playerO.socketId, playerO.userId);
    matchesServiceMock.recordMatch.mockClear();
  });

  afterEach(async () => {
    jest.clearAllTimers();
    jest.useRealTimers();

    if (moduleRef) {
      await moduleRef.close();
    }
  });

  const logState = (step: number, r: number, c: number) => {
    const state = service.getGameById(gameId);

    console.log(`\n=========================================`);
    console.log(`COUP #${step} | Position jouée : [${r}, ${c}]`);
    console.log(
      `Joueur : ${state.currentPlayer} | Queue : ${JSON.stringify(state.queuIdx)}`,
    );

    console.table(state.board);
    console.log(`=========================================\n`);
  };

  it('test 12 coups', async () => {
    const sequence = [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
      [2, 1],
      [2, 2],
      [0, 0],
      [0, 1],
      [0, 2],
    ];

    for (let i = 0; i < sequence.length; i++) {
      const [r, c] = sequence[i];

      // 1. On check AVANT de jouer
      if (service.getGameById(gameId).status === 'finished') {
        console.log(`\n Match terminer au coup ${i} ! On arrête les logs.`);
        break;
      }

      // 2. On joue et on log
      const userId = i % 2 === 0 ? playerX.userId : playerO.userId;
      await service.playMove(gameId, userId, r, c);
      logState(i + 1, r, c);
    }

    const finalState = service.getGameById(gameId);
    expect(finalState.status).toBe('finished');
  });

  it('Test draw after 20 coups', async () => {
    const safeSequence = [
      [0, 0], // Coup 1
      [0, 1], // Coup 2
      [0, 2], // Coup 3
      [1, 1], // Coup 4
      [1, 0], // Coup 5
      [2, 0], // Coup 6
      [2, 1], // Coup 7 (vider [0,0])
      [1, 2], // Coup 8 (vider [0,1])
    ];

    for (let i = 0; i < 50; i++) {
      const [r, c] = safeSequence[i % safeSequence.length];
      const userId = i % 2 === 0 ? playerX.userId : playerO.userId;
      await service.playMove(gameId, userId, r, c);

      if (service.getGameById(gameId).status === 'finished') {
        break;
      }
    }

    const finalState = service.getGameById(gameId);

    expect(finalState.moveCount).toBe(50);
    expect(finalState.status).toBe('finished');
    expect(finalState.winner).toBeNull();
  });

  it('déclare le joueur perdant s’il met plus de 30 secondes à jouer', async () => {
    jest.useFakeTimers();

    await service.playMove(gameId, playerX.userId, 0, 0);

    expect(service.getGameById(gameId).status).toBe('playing');
    expect(service.getGameById(gameId).currentPlayer).toBe('O');

    jest.advanceTimersByTime(31000);

    await service.playMove(gameId, playerO.userId, 0, 1);

    const finalState = service.getGameById(gameId);

    expect(finalState.status).toBe('finished');
    expect(finalState.winner).toBe('X');
  });
});
