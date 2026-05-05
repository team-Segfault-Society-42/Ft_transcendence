import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useLiveGamesStore } from "@/Store/liveGamesStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router"
import { useTranslation } from "react-i18next"
import { EmptyStateCard } from "@/components/ui/EmptyCard"
import { OctagonX, Binoculars } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner";

interface User {
  username: string
  avatar?: string
  bio?: string
  wins?: number
  losses?: number
  draws?: number
  xp?: number
}

export default function LiveGamesDisplay() {
  const navigate = useNavigate();
  const { games, loading } = useLiveGamesStore();
  const fetchGames = useLiveGamesStore((state) => state.fetchGames);
  const [user] = useOutletContext<[User | null]>()
  const { t } = useTranslation()


  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-10 text-white">
        <Spinner size="lg" />
      </div>
  );
}

  function renderWaitingGames() {
    if (games.waiting.length === 0) {
      return (
        <EmptyStateCard
        title="Open Games"
        icon={<OctagonX size={24} />}
        message="No open games available"
        description="Waiting for opponents"
        />
      )
    }

    return games.waiting.map((game) => (
      <Card key={game.gameId}>
        <Avatar
          src={game.playerX?.avatar || undefined}
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

  if (!user) {
    return (
    <section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
      <EmptyStateCard
      title={t("game.liveTitle")}
      icon={<Binoculars size={24} />}
      message={t("game.notConnected")}
      description={t("game.liveLogin")}
      actions={
        <>
            <Button
                onClick={() => navigate("/")}>
                    {t("buttons.backHome")}
            </Button>
        </>
    }
      />
    </section>

    )
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
