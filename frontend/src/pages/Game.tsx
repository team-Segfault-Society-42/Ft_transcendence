import { useEffect } from "react";
import Board from "../components/Board";
import { io, Socket } from "socket.io-client";
import { useParams } from "react-router-dom";
import { useGameStore } from "../Store/gameStore";

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const players = {
    X: {
      id: 1,
      nickname: "Simo",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simo",
    },
    O: {
      id: 2,
      nickname: "John",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    },
  };

  useEffect(() => {
    if (!gameId) {
      console.error("No gameId found in URL");
      return;
    }
    console.log("useEffect de Game s'execute");
    console.log("game page contruit avec gameId:", gameId);

    const client = io("http://localhost:1024", {
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
      useGameStore.getState().setError(payload.message);
    });

    return () => {
      console.log("deconexion du socket");
      client.disconnect();
    };
  }, [gameId]);

  return (
    <div>
      <Board players={players} />
    </div>
  );
}
