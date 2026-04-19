import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { cn } from "@/lib/utils"

interface User {
  username: string
  avatar?: string
  bio?: string
  wins?: number
  losses?: number
}

type Props = {
  user: User | null
  className?: string
}

export function AboutCard({ user, className }: Props) {

  const wins = user?.wins ?? 0
  const losses = user?.losses ?? 0
  const total = wins + losses
  const winrate = total > 0 ? (wins / total) * 100 : 0

  return (
    <Card
    className={cn("h-full cursor-pointer hover:scale-[1.02] flex flex-col", className)}
    >
      {/* TITLE */}
      <CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        About
      </CardTitle>

      {/* PROFILE */}
      <div className="flex items-center gap-4 mt-4">
        <Avatar
          src={user?.avatar}
          fallback={user?.username?.[0] || "?"}
          size="lg"
        />

        <div>
          <p className="font-semibold text-white">
            {user?.username || "Guest"}
          </p>
          <p className="text-xs text-white/60">
            View profile
          </p>
        </div>
      </div>

      {/* BIO */}
      <CardDescription className="mt-4">
        {user?.bio || "No bio yet"}
      </CardDescription>

      {/* STATS */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>
            Winrate
          </span>
          <span>{winrate.toFixed(1)}%</span>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-2 bg-linear-to-r from-cyan-400 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${winrate}%` }}
          />
        </div>
      </div>

    </Card>
  )
}