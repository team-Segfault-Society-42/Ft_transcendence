import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";

export default function LiveGamesDisplay() {
  return (
    <div className="p-8 space-y-10">
      <section>
        <h2>Open games</h2>
        <Card>
          <p>No open games available</p>
        </Card>
      </section>
      <section>
        <h2>Live games</h2>
        <Card>
          <p>No live games available</p>
        </Card>
      </section>
    </div>
  );
}
