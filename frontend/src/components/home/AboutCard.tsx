import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { cn } from "@/lib/utils"
import { Winrate } from "../ui/Winrate"

interface User {
  username: string
  avatar?: string
  bio?: string
  wins?: number
  losses?: number
  draws?: number
}

type Props = {
  user: User | null
  className?: string
}

export function AboutCard({ user, className }: Props) {

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
      <Winrate
        wins={user?.wins ?? 0}
        losses={user?.losses ?? 0}
        draws={user?.draws ?? 0}
      />

    </Card>
  )
}