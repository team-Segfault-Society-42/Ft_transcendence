import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useLiveGamesStore } from "@/Store/liveGamesStore";

export default function LiveGamesDisplay() {
  const games = useLiveGamesStore((state) => state.games);
  return (
    <div className="p-8 space-y-10">
      <section>
        <h2>Open games</h2>
        <p>Waiting: {games.waiting.length}</p>
      </section>

      <section>
        <h2>Live games</h2>
        <p>Playing: {games.playing.length}</p>
      </section>
    </div>
  );
}
