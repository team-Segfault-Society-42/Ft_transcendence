import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { cn } from "@/lib/utils"
import { Winrate } from "../ui/Winrate"
import { LevelProgress } from "../ui/Level"
import { useTranslation } from "react-i18next"
import { Username } from "@/components/ui/Username"

interface User {
  username: string
  avatar?: string
  bio?: string
  wins?: number
  losses?: number
  draws?: number
  xp?: number
}

type Props = {
  user: User | null
  className?: string
}

export function AboutCard({ user, className }: Props) {
  const { t } = useTranslation()

  if (!user) {
    return (
      <Card className={cn("h-full relative flex items-center justify-center bg-slate-900", className)}>

        <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("profile.about.title")}
        </CardTitle>

        <div className="flex flex-col items-center justify-center text-center gap-4">

          <div className="w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <span className="text-xl font-bold">
              ?
            </span>
          </div>

          <div>
            <p className="text-white font-medium">
              {t("profile.about.notConnected")}
            </p>

            <p className="text-sm text-white/40 mt-2">
              {t("profile.about.login")}
            </p>
          </div>
          
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn("min-h-65 h-full flex flex-col bg-slate-900", className)}
    >
      {/* TITLE */}
      <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        {t("profile.about.title")}
      </CardTitle>

      {/* PROFILE */}
      <div className="mt-12">
      <div className="flex items-center gap-4 mt-4 min-w-0">
        <Avatar
          src={user?.avatar}
          fallback={user?.username?.[0] || "?"}
          size="lg"
        />

        <div className="flex flex-col min-w-0">
          <p className="font-semibold text-white">
            {user?.username ? (
              <Username name={user.username}/>
            ) : (
              t("profile.about.guest")
            )}
          </p>
          <p className="text-xs text-white/60">
            {t("profile.about.viewProfile")}
          </p>
        </div>
      </div>
      </div>
      {/* BIO */}
      <CardDescription className="mt-4">
        {user?.bio || t("profile.about.noBio")}
      </CardDescription>

      {/* STATS */}
      <Winrate
        wins={user?.wins ?? 0}
        losses={user?.losses ?? 0}
        draws={user?.draws ?? 0}
      />

      <LevelProgress
        xp={user.xp ?? 0}
      />

    </Card>
  )
}