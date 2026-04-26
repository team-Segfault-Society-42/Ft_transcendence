import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useLiveGamesStore } from "@/Store/liveGamesStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/Spinner";

export default function LiveGamesDisplay() {
  const navigate = useNavigate();

  const { games, loading } = useLiveGamesStore();
  const fetchGames = useLiveGamesStore((state) => state.fetchGames);

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

        <Button onClick={() => navigate(`/game/${game.gameId}`)}>Join</Button>
      </Card>
    ));
  }

  function renderPlayingGames() {
    if (games.playing.length === 0) {
      return <p>No game to spectate</p>;
    }

    return games.playing.map((game) => (
      <Card key={game.gameId}>
        <Avatar
          src={game.playerX?.avatar || undefined}
          fallback={game.playerX?.username?.[0] || "?"}
          size="md"
        />

        <Avatar
          src={game.playerO?.avatar || undefined}
          fallback={game.playerO?.username?.[0] || "?"}
          size="md"
        />

        <span>
          {game.playerX?.username || "?"} vs {game.playerO?.username || "?"}
        </span>

        <Button
          variant="secondary"
          onClick={() => navigate(`/game/${game.gameId}`)}
        >
          Watch
        </Button>
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
        {renderPlayingGames()}
      </section>
    </div>
  );
}
