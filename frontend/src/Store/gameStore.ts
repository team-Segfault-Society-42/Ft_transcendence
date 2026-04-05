import { create } from "zustand";
import type { Socket } from "socket.io-client";
import type { GameState, PlayerRole } from "../type/game.types";

type GameStore = {
  gameId: string | null;
  client: Socket | null;
  game: GameState | null;
  error: string | null;
  playerRole: PlayerRole | null;

  setGameId: (gameId: string | null) => void;
  setClient: (client: Socket | null) => void;
  setPlayerRole: (role: PlayerRole | null) => void;
  syncFromServer: (game: GameState) => void;
  setError: (message: string) => void;
  resetGameState: () => void;
  playMove: (index: number) => void;
  requestReplay: () => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameId: null,
  client: null,
  game: null,
  error: null,
  playerRole: null,

  setGameId: (gameId) => set({ gameId }),
  setClient: (client) => set({ client }),
  setPlayerRole: (role) => set({ playerRole: role }),

  syncFromServer: (game) =>
    set({
      game,
      error: null,
    }),

  setError: (message) => set({ error: message }),

  resetGameState: () =>
    set({
      game: null,
      error: null,
      playerRole: null,
    }),

  requestReplay: () => {
    const { client, gameId, game, playerRole } = get();
    if (!client || !gameId || !game) return;
    if (game.status !== "finished") return;
    if (playerRole !== "X" && playerRole !== "O") return;

    client.emit("request_replay", { gameId });
  },

  playMove: (index) => {
    const { client, gameId, game } = get();

    if (!client || !gameId || !game) {
      console.warn("Missing socket, gameId or game");
      return;
    }

    if (game.status === "finished") {
      return;
    }

    const r = Math.floor(index / 3);
    const c = index % 3;

    client.emit("play_move", { gameId, r, c });
  },
}));
