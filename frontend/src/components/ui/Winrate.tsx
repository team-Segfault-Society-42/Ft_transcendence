import { useTranslation } from "react-i18next"

type Props = {
    wins: number
    losses: number
    draws?: number
  }
  
  /**
 * Displays the user's winrate statistics.
 *
 * Shows:
 * - calculated winrate percentage
 * - animated progression bar
 * - total played games
 *
 * Supports:
 * - wins
 * - losses
 * - optional draws
 */
  export function Winrate({ wins, losses, draws = 0 }: Props) {

    const totalGames = wins + losses + draws
    const winrate = totalGames > 0 ? (wins / totalGames) * 100 : 0
    const formattedWinrate = winrate.toFixed(2)
    const { t } = useTranslation()
  
    return (
      <div className="mt-8">

        {/* WINRATE HEADER */}
        <div className="flex justify-between text-sm mb-2">

            {/* WINRATE LABEL */}
            <span className="text-white/50">
                {t("profile.stats.winrate")}
            </span>

            {/* WINRATE VALUE */}
            <span className="font-semibold text-cyan-400">
              {t("profile.stats.winrateValue", { value: formattedWinrate })}
            </span>
        </div>
  
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">

          {/* WINRATE BAR */}
            <div
                className="bg-linear-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${winrate}%` }}
            />
        </div>

        {/* TOTAL GAMES */}
        <p className="text-xs text-white/50 mt-2">
            {t("profile.stats.games", { count: totalGames })}
        </p>
      </div>
    )
  }