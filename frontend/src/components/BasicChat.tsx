import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "@/type/user.types";

export function BasicChat() {
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Socket | null>(null);

  useEffect(() => {
    const client = io(window.location.origin, {
      path: "/socket.io/",
      transports: ["websocket"],
      withCredentials: true,
    });
    clientRef.current = client;

    client.on("connect", () => {
      setConnected(true);
      client.emit("join_chat");
    });
    client.on("disconnect", () => setConnected(false));

    client.on("chat_ready", () => {
      console.log("Chat ready");
    });

    client.on("chat_message", (message) => {
      console.log(message);
      setMessages((prev) => [...prev, message]);
    });

    client.on("connect_error", (error) => {
      console.error("chat socket error:", error.message);
    });

    client.on("chat_error", (error) => {
      console.error("Error:", error.error);
    });

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, []);

  function sendMessage() {
    const text = content.trim();

    if (!clientRef.current || text.length === 0) {
      return;
    }

    // setMessages((current) => [
    //   ...current,
    //   {
    //     id: Date.now(),
    //     content: text,
    //     createdAt: new Date().toISOString(),
    //     user: {
    //       id: 0,
    //       username: "Me",
    //       avatar: null,
    //     },
    //   },
    // ]);
    clientRef.current.emit("chat_send", {
      content: text,
    });

    setContent("");
  }

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
