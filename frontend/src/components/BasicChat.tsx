import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "@/type/user.types";

type BasicChatProps = {
  onClose: () => void;
};
// Basic UI only. Final design can be added later.
export function BasicChat({ onClose }: BasicChatProps) {
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

    clientRef.current.emit("chat_send", {
      content: text,
    });

    setContent("");
  }

  return (
    <section className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2">
        <h1>Chat</h1>
        <button onClick={onClose} className="text-white hover:text-red-400">
          x
        </button>
      </div>
      <p>{connected ? "connected" : "disconnected"}</p>

      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id}>
            <span className="text-gray-400 text-sm">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-fuchsia-400 font-bold mx-1">
              @{message.user.username}:
            </span>
            <span>{message.content}</span>
          </div>
        ))}
      </div>

      <div>
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

        <Button onClick={sendMessage}>{">"}</Button>
      </div>
    </section>
  );
}
