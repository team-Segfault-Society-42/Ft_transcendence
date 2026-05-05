import { userService } from "@/services/userService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Username } from "@/components/ui/Username";

interface LeaderBoard {
  id: number;
  username: string;
  xp: number;
  wins: number;
  totalGames: number;
}

export default function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState<LeaderBoard[]>([]);
  const [sortBy, setSortBy] = useState<"xp" | "totalGames" | "wins">("wins");
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await userService.getLeaderboard(sortBy);
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    }
    fetchLeaderboard();
  }, [sortBy]);

  return (
    <div className="max-w-3xl mx-auto text-white p-6">

        <h1 className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent text-3xl mb-8 text-center">
          {t("leaderboard.title")}
        </h1>
      
      <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex gap-4 justify-center mb-8">
          <Button
            onClick={() => setSortBy("xp")}
            variant={sortBy === "xp"
              ? "primary"
              : "secondary"
            }
          >
            {t("leaderboard.topXP")}
          </Button>

          <Button
            onClick={() => setSortBy("wins")}
            variant={sortBy === "wins"
              ? "primary"
              : "secondary"}
          >
            {t("leaderboard.topWins")}
          </Button>

          <Button
            onClick={() => setSortBy("totalGames")}
            variant={sortBy === "totalGames"
              ? "primary"
              : "secondary"}
          >
            {t("leaderboard.topTotalGames")}
          </Button>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-center">
            {t("leaderboard.empty")}
          </p>
        ) : (
          <div>
            {leaderboard.map((l, index) => (
              <div
                key={l.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="text-white/30 font-mono w-6">
                    #{index + 1}
                  </span>
                  <Username
                    name={l.username}
                    variant="profile"
                    className="font-medium min-w-0"/>
                </div>

                <div className="text-right">
                  <p className="text-blue-400 font-bold">
                    {sortBy === "xp"
                      ? t("leaderboard.xp", { value: l.xp })
                      : sortBy === "totalGames"
                        ? t("leaderboard.totalGames", { value: l.totalGames })
                        : t("leaderboard.wins", { value: l.wins ?? 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
