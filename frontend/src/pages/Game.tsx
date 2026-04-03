import { useEffect } from "react";
import Board from "../components/Board";
import { io, Socket } from "socket.io-client";

export default function Game() {
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
    console.log("useEffect de Game s'exécute");

    const client = io("http://localhost:1024", {
      path: "/socket.io/",
      transports: ["websocket"],
      withCredentials: true,
    });

    client.on("connect", () => {
      console.log("client connected:", client.id);
      client.emit("join_game", "game42");
    });
    client.on("connect_error", (error) =>
      console.error("connexion error:", error.message, error),
    );
    client.on("disconnect", (reason) =>
      console.log("client déconnecte:", client.id, "Raison:", reason),
    );

    client.on("game_error", (reason) =>
      console.log("game_error:", client.id, "Raison:", reason),
    );
    client.on("game_update", (reason) =>
      console.log("game_update:", client.id, "Raison:", reason),
    );

    return () => {
      console.log("deconexion du socket");
      client.disconnect();
    };
  }, []);

  return (
    <div>
      <Board players={players} />
    </div>
  );
}
