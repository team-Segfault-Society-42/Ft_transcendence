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
    const client = io("http://localhost:1024/socket.io", {
      // transports: ["websocket"], // Désactivé temporairement pour laisser Socket.io faire du polling en cas d'échec
      withCredentials: true,
    });

    client.on("connect", () => console.log("✅ Socket connecté:", client.id));
    client.on("connect_error", (error) =>
      console.error("❌ Erreur de connexion:", error.message, error),
    );
    client.on("disconnect", (reason) =>
      console.log("🔌 Socket déconnecté:", client.id, "Raison:", reason),
    );

    return () => {
      console.log("🧹 Démontage du composant : déconnexion du socket");
      client.disconnect();
    };
  }, []);

  return (
    <div>
      <Board players={players} />
    </div>
  );
}
