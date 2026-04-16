import { api } from "@/services/api";

export async function createGame() {
  const response = await api.post<{ gameId: string }>("game/create");
  return response.data;
}

export const gameApi = {
  createGame,
};
