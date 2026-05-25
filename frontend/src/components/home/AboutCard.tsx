import { Card, CardTitle, CardDescription } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { cn } from "@/lib/utils"
import { Winrate } from "../ui/Winrate"
import { LevelProgress } from "../ui/Level"
import { useTranslation } from "react-i18next"
import { Username } from "@/components/ui/Username"
import { EmptyStateCard } from "../ui/EmptyCard"
import { UserRound } from "lucide-react"
import type { User } from "@/type/user.types";

type Props = {
  user: User | null
  className?: string
}

/**
 * Displays the authenticated user's profile summary.
 *
 * Shows:
 * - avatar and username
 * - biography
 * - winrate statistics
 * - XP progression
 *
 * Displays an empty state when no user is connected.
 */
export function AboutCard({ user, className }: Props) {
  const { t } = useTranslation()

  {/* GUESS STATE CARD */}
  if (!user) {
    return (
      <EmptyStateCard
      title={t("profile.about.title")}
      icon={<UserRound size={24} />}
      message={t("profile.about.notConnected")}
      description={t("profile.about.login")}
    />
    )
  }

  return (
    <Card
      className={cn("min-h-65 h-full flex flex-col bg-slate-900", className)}
    >
      {/* CARD HEADER */}
      <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        {t("profile.about.title")}
      </CardTitle>

      {/* PROFILE SECTION */}
      <div className="mt-12">

        {/* USER INFOS */}
        <div className="flex items-center gap-4 mt-4 min-w-0">
          <Avatar
            src={user?.avatar ?? undefined}
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