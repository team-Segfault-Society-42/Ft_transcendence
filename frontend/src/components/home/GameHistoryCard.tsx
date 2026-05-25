import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import type { Match } from "@/lib/match";
import { cn } from "@/lib/utils";
import { CardTitle } from "@/components/ui/Card";
import { useTranslation } from "react-i18next";
import { History as HistoryIcon } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import type { User } from "@/type/user.types";
import { Username } from "../ui/Username";

type Props = {
    matches: Match[]
    className?: string
    title?: string
    user: User | null
}

/**
 * Displays the authenticated user's recent match history.
 *
 * Shows:
 * - opponent information
 * - match result
 * - match score
 * - match date
 *
 * Displays:
 * - a guest empty state when no user is connected
 * - an empty history state when no matches exist
 */
export function GameHistoryCard({ matches, className, user }: Props) {
    const { t } = useTranslation()
    const displayedMatches = matches
    const navigate = useNavigate()

    {/* GUESS STATE CARD */}
    if (!user) {
        return (
            <EmptyStateCard
                title={t("history.title")}
                icon={<HistoryIcon size={24} />}
                message={t("history.notConnected")}
                description={t("history.login")}
                className={className}
            />
        )
    }

    {/* EMPTY HISTORY STATE */}
    if (!displayedMatches.length) {
		return (
			<EmptyStateCard
				title={t("history.title")}
				icon={<HistoryIcon size={24} />}
				message={t("history.empty")}
				description={t("history.emptyDesc")}
				className="min-h-80 bg-slate-900"
                actions={
					<Button
					onClick={() => navigate("/")}>
						{t("buttons.backHome")}
					</Button>
				}
			/>
		)
	}

	return (
    <Card className={cn("min-h-80 h-full relative flex flex-col bg-slate-900", className)}>

        {/* CARD HEADER */}
        <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            {t("history.title")}
        </CardTitle>

        {/* MATCH COUNT */}
        <span className="text-xs text-white/50 mt-8">
            {t("profile.stats.games", { count: matches.length })}
        </span>

    {/* MATCHES LIST */}
    <div className="flex-1 flex flex-col mt-8 px-3 sm:px-4 overflow-y-auto gap-2 sm:gap-3 max-h-105">
        {displayedMatches.map((match) => {

            const result = match.result.toLowerCase()

            {/* RESULT TEXT COLOR */}
            const resultColor =
            	result === "win"
                ? "text-green-400"
                : result === "loss"
                ? "text-red-400"
                : "text-yellow-400"

            {/* RESULT BORDER COLOR */}
            const borderColor =
              	result === "win"
                ? "border-green-400/30"
                : result === "loss"
                ? "border-red-400/30"
                : "border-yellow-400/30"

            {/* RESULT BACKGROUND COLOR */}
            const bgColor =
              	result === "win"
                ? "bg-green-500/10"
                : result === "loss"
                ? "bg-red-500/10"
                : "bg-yellow-500/10"

    return (
        <div
        key={match.id}
        className={cn("flex items-center justify-between p-3 rounded-xl border transition hover:scale-[1.01]",
        bgColor,
        borderColor
        )}>

    {/* LEFT */}
    {/* MATCH INFOS */}
    <div 
    onClick={() => navigate(`/profile/${match.opponent.username}`)}
    className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0">
        <Avatar
            src={match.opponent.avatar}
            fallback={match.opponent.username[0]}
        />

        {/* OPPONENT INFOS */}
		<div className="min-w-0">
    
			<div className="font-medium flex items-center gap-1">
       			{t("game.vs")}
                <Username
                name={match.opponent.username}
                variant="topbar"/>
     		</div>

            {/* MATCH DATE */}
    		<p className="text-xs text-white/60">
        		{new Date(match.date).toLocaleDateString()}
    		</p>
    	</div>

    </div>

    {/* RIGHT */}
    {/* MATCH RESULT SECTION */}
    <div className="hidden md:block text-right">

        {/* RESULT STATUS */}
        <p className={cn("font-semibold uppercase", resultColor)}>
            {t(`backend.STATUS_MATCH_${result.toUpperCase()}`)}
        </p>

        {/* MATCH SCORE */}
        <p className="text-xs text-white/50">
            {match.myScore} - {match.oppScore}
        </p>
	</div>

    </div>
    )
    })}

    </div>
    
    </Card>
  )
}