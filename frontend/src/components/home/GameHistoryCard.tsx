import { Card, CardTitle } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import type { Match } from "@/lib/match"
import { cn } from "@/lib/utils"

type Props = {
    matches: Match[]
    className?: string
  }

export function GameHistoryCard({ matches, className }: Props) {

  return (
    <Card className={cn("h-full flex flex-col", className)}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          Game History
        </CardTitle>

        <span className="text-xs text-white/50">
          {matches.length} games
        </span>
      </div>

      {/* LIST */}
      <div className="space-y-3">

        {matches.length ? (
          matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between bg-white/5 p-3 rounded-xl hover:bg-white/10 hover:scale-[1.01] transition"
            >

              {/* LEFT */}
              <div className="flex items-center gap-3">

                <Avatar
                  src={match.opponent.avatar}
                  fallback={match.opponent.username[0]}
                />

                <div>
                  <p className="font-medium">
                    {match.opponent.username}
                  </p>

                  <p className="text-xs text-white/60">
                    {new Date(match.date).toLocaleDateString()}
                  </p>
                </div>

              </div>

              {/* RIGHT */}
              <div className="text-right">

                <p
                  className={
                    match.result === "WIN"
                      ? "text-green-400 font-semibold"
                      : match.result === "LOSS"
                      ? "text-red-400 font-semibold"
                      : "text-yellow-400 font-semibold"
                  }
                >
                  {match.result}
                </p>

                <p className="text-xs text-white/50">
                  {match.myScore} - {match.oppScore}
                </p>

              </div>

            </div>
          ))
        ) : (
          <p className="text-sm text-white/60 text-center">
            No games yet
          </p>
        )}

      </div>

    </Card>
  )
}