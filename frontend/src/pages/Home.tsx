import { Link } from "react-router-dom";
import { AboutCard } from "@/components/home/AboutCard";
import { PlayCard } from "@/components/home/playcard/PlayCard";
import { GameHistoryCard } from "@/components/home/GameHistoryCard";
import type { Match } from "@/lib/match";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { userService } from "@/services/userService";
import { Motion } from "@/components/ui/Motion";
import { useTranslation } from "react-i18next";
import type { User } from "@/type/user.types";

export default function Home() {
  const [user] = useOutletContext<[User | null, React.Dispatch<React.SetStateAction<User | null>>]>();
  const [matches, setMatches] = useState<Match[]>([]);
  const { t } = useTranslation();

  /**
   * Fetch the authenticated user's match history
   * whenever the connected user changes.
   *
   * Clears the history if no user is authenticated.
   */
  useEffect(() => {
    if (!user) {
      setMatches([]);
      return;
    }
    userService
      .getUserHistory(user.id)
      .then(setMatches)
      .catch(() => setMatches([]));
  }, [user]);

  return (
    <section className="w-full flex flex-col gap-6">
      {/* HERO BANNER WITH EFFECT */}
      <Motion>
        <div className="bg-slate-900 mx-6 mt-6 relative overflow-hidden rounded-2xl border border-white/10 h-62.5 md:h-75">
          <img
            src="/tictactoe.png"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
          />

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <h2 className="text-3xl md:text-5xl font-extrabold bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              {t("home.hero.title")}
            </h2>
            <p className="text-white/70 max-w-xl mt-2">
              {t("home.hero.texte")}
            </p>
          </div>
        </div>
      </Motion>

      {/* ABOUT CARD */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/profile" className="h-full">
          <AboutCard user={user} className="flex-1" />
        </Link>

        {/* PLAYCARD WHEN USER CONNECTED, OTHERWISE RULES CARD */}
        {user ? (
            <PlayCard user={user} />
        ) : (
          <Link to="/rules">
            <PlayCard user={user} />
          </Link>
        )}

        {/* HISTORY CARD */}
        <Link to="/history" className="h-full">
          <GameHistoryCard matches={matches} user={user} />
        </Link>
      </div>
    </section>
  );
}