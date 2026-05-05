import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function BasicChat() {
  return (
    <section>
      <h1>Chat</h1>
      <div></div>
      <Input placeholder="Message" />
      <Button>Send</Button>
    </section>
  );
}
