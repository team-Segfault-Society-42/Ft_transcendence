import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function BasicChat() {
  const [content, setContent] = useState("");

  return (
    <section>
      <h1>Chat</h1>
      <div></div>
      <Input
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Message"
      />
      <p>{content}</p>
      <Button>Send</Button>
    </section>
  );
}
