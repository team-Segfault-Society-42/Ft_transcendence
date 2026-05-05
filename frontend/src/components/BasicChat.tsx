import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

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
  const [messages, setMessage] = useState<ChatMessage[]>([]);

  function sendMessage() {
    const text = content.trim();

    if (text.length === 0) {
      return;
    }
    setMessage((current) => [
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

  return (
    <section>
      <h1>Chat</h1>
      <div></div>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={(event) => {
          if (event.key == "Enter" && !event.shiftKey) {
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
            {" "}
            <strong>{message.user.username}</strong>
          </p>
          <p>{message.content}</p>
          <small>{message.createdAt}</small>
        </div>
      ))}
      <Button onClick={sendMessage}>Send</Button>
    </section>
  );
}
