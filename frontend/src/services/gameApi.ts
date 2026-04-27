import { api } from "@/services/api";
import type { LiveGamesResponse } from "@/type/game.types";

export async function createGame() {
  const response = await api.post<{ gameId: string }>("game/create");
  return response.data;
}

export async function getLiveGames() {
  const response = await api.get<LiveGamesResponse>("game/liveGames");
  return response.data;
}

export const gameApi = {
  createGame,
  getLiveGames,
};
