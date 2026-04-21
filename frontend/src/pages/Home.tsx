import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Motion } from "@/components/ui/Motion";
import { gameApi } from "@/services/gameApi";
import { AboutCard } from "@/components/home/AboutCard"
import { PlayCard } from "@/components/home/PlayCard"
import { GameHistoryCard } from "@/components/home/GameHistoryCard"
import type { Match } from "@/lib/match"
import { useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import { userService } from "@/services/userService"

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user] = useOutletContext<any>()
  const [matches, setMatches] = useState<Match[]>([])

  const handleFindOpponent = async () => {
    try {
      const response = await fetch("/api/game/create", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data: { gameId: string } = await response.json();
      navigate(`/game/${data.gameId}`);
    } catch (error) {
      console.log("created game error:", error);
    }
  };

  useEffect(() => {
    if (!user) return
  
    userService.getUserHistory(user.id)
      .then(setMatches)
  }, [user])

  return (
    <section className="w-full flex flex-col gap-10">

    <Motion>
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>

        <p className="bg-linear-to-r from-cyan-400 to-pink-500  bg-clip-text text-transparent max-w-md mx-auto text-lg">
          {t("home.hero.texte")}
        </p>
      </div>
    </Motion>

    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* CARDS */}
        <Link to="/profile">
          <div className="lg:col-span-1 flex h-full">
            <AboutCard user={user}
            className="flex-1"
            />
          </div>
        </Link>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Link to="/game">
            <PlayCard onFindOpponent={handleFindOpponent}
            className="h-45"
            />
          </Link>
          <Link to="/history">
              <GameHistoryCard matches={matches}
              className="h-65"
              />
          </Link>
        </div>

      </div>
    </section>
  );
}
