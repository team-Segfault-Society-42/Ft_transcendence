import { useEffect } from "react";
import Board from "../components/Board";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { useGameStore } from "../Store/gameStore";
import { gameErrorMsg } from "@/lib/gameErrorMsg";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();

  useEffect(() => {
    if (!gameId) {
      console.error("No gameId found in URL");
      return;
    }

    useGameStore.getState().resetGameState();

    const client = io(window.location.origin, {
      path: "/socket.io/",
      transports: ["websocket"],
      withCredentials: true,
    });

    client.on("connect", () => {
      useGameStore.getState().setGameId(gameId);
      useGameStore.getState().setClient(client);
      client.emit("join_game", { gameId });
    });

    client.on("joined_as", (payload) => {
      useGameStore.getState().setPlayerRole(payload.role);
    });

    client.on("connect_error", (error) =>
      console.error("connexion error:", error.message, error),
    );

    client.on("game_updated", (payload) => {
      useGameStore.getState().syncFromServer(payload);
    });

    client.on("game_error", (payload) => {
      const message = gameErrorMsg(payload.message);

      if (message === "Game not found") {
        useGameStore.getState().resetGameState();
        useGameStore.getState().setError("Game no longer available");
        return;
      }
      useGameStore.getState().setError(gameErrorMsg(payload.message));
    });

    return () => {
      client.disconnect();
      useGameStore.getState().resetGameState();
    };
  }, [gameId]);

  return (
    <div>
      <Board />
    </div>
  );
}
