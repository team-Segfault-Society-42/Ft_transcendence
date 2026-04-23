import { useTranslation } from "react-i18next"

type Props = {
    wins: number
    losses: number
    draws?: number
  }
  
  export function Winrate({ wins, losses, draws = 0 }: Props) {

    const totalGames = wins + losses + draws
    const winrate = totalGames > 0 ? (wins / totalGames) * 100 : 0
    const { t } = useTranslation()
  
    return (
      <div className="mt-8">
        <div className="flex justify-between text-sm mb-2">
            <span className="text-white/50">
                {t("profile.stats.winrate")}
            </span>
            <span className="font-semibold text-cyan-400">
                {winrate}%
            </span>
        </div>
  
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <div
                className="bg-linear-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${winrate}%` }}
            />
        </div>

        <p className="text-xs text-white/50 mt-2">
            {t("profile.stats.games", { count: totalGames })}
        </p>
      </div>
    )
  }