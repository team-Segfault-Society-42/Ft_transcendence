export type PlayerSymbol = 'X' | 'O';

export type CellValue = PlayerSymbol | null;

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface BoardPosition {
  r: number;
  c: number;
}

export interface Move extends BoardPosition {
  player: PlayerSymbol;
}

export interface GameState {
  board: CellValue[][];
  currentPlayer: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | null;
  moveCount: number;
  startTime: number;
  idx: number;
  queuIdx: BoardPosition[];
  toDisapear: number;
}

// 	queue,
// 	idx,
// 	history,
// 	scores,
// 	resetSession,
// 	replayGame,

// const toDisapear = idx > 5 ? queue[idx % 6] : -1
