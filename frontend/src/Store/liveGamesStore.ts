import type { LivesGamesResponse } from "@/type/game.types";

type LiveGameStore = {
  games: LivesGamesResponse;
  loading: boolean;
  error: string | null;

  fetchGame: () => Promise<void>;
  reset: () => void;
};
