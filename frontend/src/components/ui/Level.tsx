import { useTranslation } from "react-i18next"
import { getLevelProgress } from "@/lib/levelUtils"

interface LevelProgressProps {
  xp: number
}

export function LevelProgress({ xp }: LevelProgressProps) {
  const { t } = useTranslation()
  const { currentLevel, currentXp, neededXp, percent } = getLevelProgress(xp)

  return (
    <div className="mt-8">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/50 font-medium">
          {t("profile.level", {currentLevel})}
        </span>

        <span className="text-white/30 text-[10px] uppercase tracking-tighter">
          {t("profile.xp", { current: currentXp, max: neededXp })}
        </span>
      </div>

      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-linear-to-r from-purple-500 to-pink-500 h-full transition-all duration-700"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}