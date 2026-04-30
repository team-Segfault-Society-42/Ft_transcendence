import { Card } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import type { Match } from "@/lib/match"
import { cn } from "@/lib/utils"
import { CardTitle } from "@/components/ui/Card"
import { useTranslation } from "react-i18next"
import { GameHistoryEmpty } from "../ui/GameHistoryEmpty"

type Props = {
    matches: Match[]
    className?: string
    title?: string
}

export function GameHistoryCard({ matches, className }: Props) {
    const { t } = useTranslation()

	return (
    <Card className={cn("min-h-80 h-full relative flex flex-col items-center justify-center bg-slate-900", className)}>

    {/* HEADER */}
            <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                {t("history.title")}
            </CardTitle>
        <span className="text-xs text-white/50 absolute top-6 right-6">
            {t("profile.stats.games", { count: matches.length })}
        </span>

    {/* LIST */}
    <div className="flex-1 flex items-center justify-center mt-4">
        {matches.length ? (
        	matches.map((match) => {

            const result = match.result.toLowerCase()

            const resultColor =
            	result === "win"
                ? "text-green-400"
                : result === "loss"
                ? "text-red-400"
                : "text-yellow-400"

            const borderColor =
              	result === "win"
                ? "border-green-400/30"
                : result === "loss"
                ? "border-red-400/30"
                : "border-yellow-400/30"

            const bgColor =
              	result === "win"
                ? "bg-green-500/10"
                : result === "loss"
                ? "bg-red-500/10"
                : "bg-yellow-500/10"

            return (
              	<div
                  	key={match.id}
                  	className={cn(
                  	"flex items-center justify-between p-3 rounded-xl border transition hover:scale-[1.01]",
                  	bgColor,
                  	borderColor
              	)}>

    {/* LEFT */}
    <div className="flex items-center gap-3">
        <Avatar
            src={match.opponent.avatar}
            fallback={match.opponent.username[0]}
        />
		<div>
    
			<p className="font-medium">
       			{t("game.vs")} {match.opponent.username}
     		</p>

    		<p className="text-xs text-white/60">
        		{new Date(match.date).toLocaleDateString()}
    		</p>
    	</div>

    </div>

    {/* RIGHT */}
    <div className="text-right">
        <p className={cn("font-semibold uppercase", resultColor)}>
            {t(`game.result.${result}`)}
        </p>

        <p className="text-xs text-white/50">
            {match.myScore} - {match.oppScore}
        </p>
	</div>

    </div>
    )
    })
    ) : (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-white text-center">
            {t("history.empty")}
        </p>

        <Card className="h-full flex flex-col items-center justify-center mt-6">
            <GameHistoryEmpty />
        </Card>
    </div>

    
    )}

    </div>

    </Card>
  )
}