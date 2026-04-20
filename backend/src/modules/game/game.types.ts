export type PlayerSymbol = 'X' | 'O';

export type CellValue = PlayerSymbol | null;

export type GameStatus = 'waiting' | 'playing' | 'finished';

export type EndReason = 'win' | 'draw' | 'timeout' | 'forfeit' | null;

export type PlayerRole = PlayerSymbol | 'spectator';

export type MovesGameHistory = number[];

export type SpectatorsCnt = number;

export interface PublicPlayerProfile {
  id: number;
  username: string;
  avatar: string | null;
}

export interface PlayerProfilesInGame {
  X: PublicPlayerProfile | null;
  O: PublicPlayerProfile | null;
}

export interface BoardPosition {
  r: number;
  c: number;
}

export interface Move extends BoardPosition {
  player: PlayerSymbol;
}

// to stock socketId of client x and client o
export interface PlayersInGame {
  X: string | null;
  O: string | null;
}

export interface ReplayState {
  X: boolean;
  O: boolean;
}

export interface ScoreBoard {
  X: number;
  O: number;
  D: number;
}

export interface GameState {
  board: CellValue[][];
  currentPlayer: PlayerSymbol;
  status: GameStatus;
  winner: PlayerSymbol | null;
  endReason: EndReason;

  moveCount: number;
  queuIdx: BoardPosition[];
  toDisapear: number;
  lastMove: number;

  players: PlayersInGame;
  scores: ScoreBoard;
  replayVotes: ReplayState;
  playerProfiles: PlayerProfilesInGame;
  movesGameHistory: MovesGameHistory;
  spectatCnt: SpectatorsCnt;
}
