import { userService } from "@/services/userService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Username } from "@/components/ui/Username";
import { useOutletContext } from "react-router";
import { Trophy } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useNavigate } from "react-router-dom";
import { Card, CardTitle } from "@/components/ui/Card"
import type { User } from "@/type/user.types"

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
  const [user] = useOutletContext<[User | null]>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    async function fetchLeaderboard() {
      try {
        const data = await userService.getLeaderboard(sortBy);
        setLeaderboard(data);
      } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("Failed to fetch leaderboard:", error.message)
          } else {
            console.error('Failed to fetch leaderboard: An unknown error occurred');
          }
      }
    }
    fetchLeaderboard();
  }, [sortBy, user]);

  if (!user) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-10">
        <EmptyStateCard
          title={t("leaderboard.title")}
          icon={<Trophy size={24} />}
          message={t("leaderboard.notConnected")}
          description={t("leaderboard.login")}
          actions={
            <>
              <Button
                  onClick={() => navigate("/")}>
                    {t("buttons.backHome")}
              </Button>
            </>
          }
        />
      </div>
    )
  }

  return (
    <section className="w-full max-w-3xl mx-auto px-6 py-10">

      <Card className="h-full relative flex items-center justify-center bg-slate-900">

        <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("leaderboard.title")}
        </CardTitle>
      
      <div className="flex flex-col pt-20 pb-10 gap-6">
        <div className="flex flex-col gap-4 justify-center mb-8 sm:flex-row w-full">
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
                onClick={() => navigate(`/profile/${l.username}`)}
                className="flex flex-col items-center cursor-pointer justify-between p-4 bg-white/5 border border-white/10 rounded-xl sm:flex-row"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="text-white/30 font-mono w-6">
                    #{index + 1}
                  </span>
                  <Username
                    name={l.username}
                    variant="card"
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
      </Card>
    </section>
  );
}
