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
        	Match History
        </CardTitle>

        <span className="text-xs text-white/50 top-left">
        	{matches.length} games
        </span>
    </div>

    {/* LIST */}
    <div className="space-y-3">
        {matches.length ? (
        	matches.map((matches) => {

            const result = matches.result.toLowerCase()

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
                  	key={matches.id}
                  	className={cn(
                  	"flex items-center justify-between p-3 rounded-xl border transition hover:scale-[1.01]",
                  	bgColor,
                  	borderColor
              	)}>

    {/* LEFT */}
    <div className="flex items-center gap-3">
        <Avatar
            src={matches.opponent.avatar}
            fallback={matches.opponent.username[0]}
        />
		<div>
    
			<p className="font-medium">
       			vs {matches.opponent.username}
     		</p>

    		<p className="text-xs text-white/60">
        		{new Date(matches.date).toLocaleDateString()}
    		</p>
    	</div>

    </div>

    {/* RIGHT */}
    <div className="text-right">
        <p className={cn("font-semibold uppercase", resultColor)}>
            {result}
        </p>

        <p className="text-xs text-white/50">
            {matches.myScore} - {matches.oppScore}
        </p>
	</div>

    </div>
    )
    })
    ) : (
        <p className="text-sm text-white/60 text-center">
            No games yet
        </p>
    )}

    </div>

    </Card>
  )
}