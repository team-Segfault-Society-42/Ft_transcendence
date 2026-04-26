import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useLiveGamesStore } from "@/Store/liveGamesStore";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

export default function LiveGamesDisplay() {
  const { games, loading } = useLiveGamesStore();
  const fetchGames = useLiveGamesStore((state) => state.fetchGame);
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  function renderWaitingGames() {
    if (games.waiting.length === 0) {
      return <p>No open games</p>;
    }

    return games.waiting.map((game) => (
      <Card key={game.gameId}>
        <Avatar
          src={game.playerX?.avatar}
          fallback={game.playerX?.username[0] || "?"}
          size="md"
        />

        <span>{game.playerX?.username} is waiting</span>

        <Button>Join</Button>
      </Card>
    ));
  }

  if (loading) {
    return <Spinner variant="cyan" size="lg" />;
  }
  return (
    <div className="p-8 space-y-10">
      <section>
        <h2>Open games</h2>
        {renderWaitingGames()}
      </section>

      <section>
        <h2>Live games</h2>
        <p>Playing: {games.playing.length}</p>

        <Card>
          <Avatar fallback="A" size="md" />
          <Avatar fallback="B" size="md" />
          <span>Alice vs Bob</span>
          <Button variant="secondary">Watch</Button>
        </Card>
      </section>
    </div>
  );
}
