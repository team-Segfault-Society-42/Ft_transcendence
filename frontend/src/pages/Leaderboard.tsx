import { userService } from "@/services/userService";
import { useEffect, useState } from "react";

interface LeaderBoard {
  id: number;
  username: string;
  xp: number;
}

export default function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState<LeaderBoard[]>([]);

  useEffect(() => {
    async function fetchLeaderboard() {

        try {
            const data = await userService.getLeaderboard()
            setLeaderboard(data)
        } 
        catch (error) {
        console.error("Failed to fetch leaderboard:", error)
        }
    }
    fetchLeaderboard()

  }, [])

  // DEBUG
  console.log(leaderboard)
  //
  

  return (
    <div className="max-w-3xl mx-auto text-white p-6">
      <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center justify-center gap-2">
          LeaderBoard
        </h3>

        {leaderboard.length === 0 ? (
          <p> No players are listed in the rankings </p>
        ) : (
          <div>
            {leaderboard.map((l) => (
              <div
                key={l.id}
                style={{
                  border: "1px solid #ccc",
                  margin: "10px 0",
                  padding: "10px",
                }}
              >
                <p>Username: {l.username} </p>
                <p>XP: {l.xp} </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
