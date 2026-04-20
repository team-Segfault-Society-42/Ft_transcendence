import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useOutletContext } from "react-router"
import { Spinner } from "@/components/ui/Spinner"
import { Card, CardTitle } from "@/components/ui/Card"
import { userService } from "@/services/userService"
import type { Match } from "@/lib/match"
import { GameHistoryCard } from "@/components/home/GameHistoryCard"

interface User {
	id: number
	username: string
}

export default function History() {
	
	const { t } = useTranslation()
	const [user] = useOutletContext<[User | null, any]>()
	const [matches, setMatches] = useState<Match[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!user) return

	const userId = user.id
	async function fetchHistory() {
	try {
		const data = await userService.getUserHistory(userId)

    	// tri
        const sorted = data.sort(
          	(a: Match, b: Match) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        setMatches(sorted)
      } catch (error) {
        console.error("Failed to fetch history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  	}, [user])

  	if (!user || loading) {
    	return (
    		<div className="flex justify-center mt-20">
        		<Spinner variant="cyan" size="lg" />
      		</div>
    	)
  	}

  	return (
		<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">

		{/* TITLE */}
		<CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent text-3xl mb-8 text-center">
			{t("history.title") || "Match History"}
		</CardTitle>

		{/* CARD */}
		<Card className="p-6 backdrop-blur-xl bg-white/5 border border-white/10">
        	<GameHistoryCard matches={matches} />
    	</Card>

    </section>
  )
}