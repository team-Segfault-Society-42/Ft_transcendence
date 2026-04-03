import { create } from "zustand";
import type { Socket } from "socket.io-client";
import type { GameState } from "../../../backend/src/modules/game/game.types";

type GameStore = {
  gameId: string | null;
  client: Socket | null;
  game: GameState | null;
  error: string | null;

  setGameId: (gameId: string | null) => void;
  setClient: (client: Socket | null) => void;
  syncFromServer: (game: GameState) => void;
  setError: (message: string) => void;
  resetGameState: () => void;
  playMove: (index: number) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameId: null,
  client: null,
  game: null,
  error: null,

  setGameId: (gameId) => set({ gameId }),
  setClient: (client) => set({ client }),

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
    }),

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
