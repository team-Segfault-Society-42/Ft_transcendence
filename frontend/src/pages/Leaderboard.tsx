import { userService } from "@/services/userService";
import { useEffect, useState } from "react";

interface LeaderBoard {
  id: number;
  username: string;
  xp: number;
  wins: number;
}

export default function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState<LeaderBoard[]>([]);
  const [sortBy, setSortBy] = useState<"xp" | "wins">("wins");

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

  // DEBUG
  console.log(leaderboard);
  console.log(sortBy);
  //

  return (
    <div className="max-w-3xl mx-auto text-white p-6">
      <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center justify-center gap-2">
          LeaderBoard
        </h3>

        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setSortBy("xp")}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === "xp"
                ? "bg-blue-600 shadow-lg shadow-blue-900/20"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            Top XP
          </button>

          <button
            onClick={() => setSortBy("wins")}
            className={`px-4 py-2 rounded-lg transition-all ${
              sortBy === "wins"
                ? "bg-blue-600 shadow-lg shadow-blue-900/20"
                : "bg-white/1 hover:bg-white/10"
            }`}
          >
            Top Wins
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <p> No players are listed in the rankings </p>
        ) : (
          <div>
            {leaderboard.map((l, index) => (
              <div
                key={l.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="text-white/30 font-mono w-6">
                    #{index + 1}
                  </span>
                  <p className="font-medium">{l.username}</p>
                </div>

                <div className="text-right">
                  <p className="text-blue-400 font-bold">
                    {sortBy === "xp"
                      ? `${l.xp} XP`
                      : `${l.wins ?? 0} Victoires`}
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
