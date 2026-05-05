import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { io } from "socket.io-client";

type UserChat = {
  id: number;
  username: string;
  avatar: string | null;
};

type ChatMessage = {
  id: number;
  content: string;
  createdAt: string;
  user: UserChat;
};

export function BasicChat() {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  function sendMessage() {
    const text = content.trim();

    if (text.length === 0) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        content: text,
        createdAt: new Date().toISOString(),
        user: {
          id: 0,
          username: "Me",
          avatar: null,
        },
      },
    ]);

    setContent("");
  }

  useEffect(() => {
    const socket = io(window.location.origin, {
      path: "/socket.io/",
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", (error) => {
      console.error("chat socket error:", error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <section>
      <h1>Chat</h1>

      <div>
        <p>{connected ? "connected" : "disconnected"}</p>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
          }
        }}
        placeholder="Message"
        rows={4}
        className="border p-2"
      />

      {messages.map((message) => (
        <div key={message.id}>
          <p>
            <strong>{message.user.username}</strong>
          </p>

          <p>{message.content}</p>

          <small>{new Date(message.createdAt).toLocaleString()}</small>
        </div>
      ))}

      <Button onClick={sendMessage}>Send</Button>
    </section>
  );
}
