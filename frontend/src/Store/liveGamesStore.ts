import { gameApi } from "@/services/gameApi";
import type { LiveGamesResponse } from "@/type/game.types";
import { create } from "zustand";

type LiveGamesStore = {
  games: LiveGamesResponse;
  loading: boolean;
  error: string | null;

  fetchGame: () => Promise<void>;
  reset: () => void;
};

export const useLiveGamesStore = create<LiveGamesStore>((set) => ({
  games: { waiting: [], playing: [] },
  loading: false,
  error: null,

  fetchGame: async () => {
    set({ loading: true, error: null });
    try {
      const data = await gameApi.getLiveGames();
      set({ games: data, loading: false });
    } catch (error) {
      console.error("Error fetching games:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch games",
        loading: false,
      });
    }
  },

  reset: () =>
    set({
      games: { waiting: [], playing: [] },
      loading: false,
      error: null,
    }),
}));
