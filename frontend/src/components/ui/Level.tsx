import { useTranslation } from "react-i18next"

interface LevelProgressProps {
  xp: number
}

export function LevelProgress({ xp }: LevelProgressProps) {
  const { t } = useTranslation()

  const level = Math.floor(xp / 100)
  const xpProgress = xp % 100

  return (
    <div className="mt-8">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/50 font-medium">
          {t("profile.level")} {level}
        </span>

        <span className="text-white/30 text-[10px] uppercase tracking-tighter">
          {xpProgress} / 100 XP
        </span>
      </div>

      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-linear-to-r from-purple-500 to-pink-500 h-full transition-all duration-700"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
    </div>
  )
}