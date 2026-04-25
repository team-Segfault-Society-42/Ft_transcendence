import { useEffect } from "react";
import Board from "../components/Board";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { useGameStore } from "../Store/gameStore";
import { gameErrorMsg } from "@/lib/gameErrorMsg";
import { toast } from "sonner";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();

  useEffect(() => {
    if (!gameId) {
      console.error("No gameId found in URL");
      return;
    }

    useGameStore.getState().resetGameState();

    console.log("useEffect de Game s'execute");
    console.log("game page contruit avec gameId:", gameId);

    const client = io(window.location.origin, {
      path: "/socket.io/",
      transports: ["websocket"],
      withCredentials: true,
    });

    client.on("connect", () => {
      console.log("client connected:", client.id);
      useGameStore.getState().setGameId(gameId);
      useGameStore.getState().setClient(client);
      client.emit("join_game", { gameId });
      console.log("join_game sent with:", gameId);
    });

    client.on("joined_as", (payload) => {
      useGameStore.getState().setPlayerRole(payload.role);
      console.log("joined as:", payload.role);
    });

    client.on("connect_error", (error) =>
      console.error("connexion error:", error.message, error),
    );
    client.on("disconnect", (reason) =>
      console.log("client disconnect. Raison:", reason),
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

    client.on("opponent_left", () => {
      toast.warning("oppenent left - no replay");
    });

    return () => {
      console.log("deconexion du socket");
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
