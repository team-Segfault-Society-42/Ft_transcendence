import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export default function LiveGamesDisplay() {
  return (
    <div className="p-8 space-y-10">
      <section>
        <h2>Open games</h2>
        <Card>
          <Avatar fallback="J" size="md" />
          <span> John is waiting for oppenennt</span>
          <Button>Join</Button>
          <p>No open games available</p>
        </Card>
      </section>
      <section>
        <h2>Live games</h2>
        <Card>
          <Avatar fallback="X" size="md" />
          <Avatar fallback="O" size="md" />
          <span> PlyerO vs PlayerX</span>
          <Button variant={"secondary"}>Watch</Button>
          <p>No live games available</p>
        </Card>
      </section>
    </div>
  );
}
