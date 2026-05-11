import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useLiveGamesStore } from "@/Store/liveGamesStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router"
import { useTranslation } from "react-i18next"
import { EmptyStateCard } from "@/components/ui/EmptyCard"
import { EyeOff, Binoculars } from "lucide-react"
import { Spinner } from "@/components/ui/Spinner";

interface User {
  username: string
  avatar?: string
  bio?: string
  wins?: number
  losses?: number
  draws?: number
  xp?: number
}

export default function LiveGamesDisplay() {

  	const navigate = useNavigate();
  	const { games, loading } = useLiveGamesStore();
  	const fetchGames = useLiveGamesStore((state) => state.fetchGames);
  	const [user] = useOutletContext<[User | null]>()
  	const { t } = useTranslation()


	useEffect(() => {
		fetchGames();
	}, [fetchGames]);

	if (loading) {
		return (
		<div className="w-full flex justify-center items-center py-10 text-white">
			<Spinner size="lg" />
		</div>
		);
	}

  	function renderPlayingGames() {

    if (games.playing.length === 0) {
		return (
			<EmptyStateCard
			title={t("game.liveTitle")}
			icon={<EyeOff size={24} />}
			message={t("game.liveEmpty")}
			description={t("game.liveDesc")}
			actions={
			<>
				<Button
				onClick={() => navigate("/")}>
					{t("buttons.backHome")}
				</Button>
			</>
			}
			/>
		)
    }

    return (
		<Card className="min-h-80 h-full relative flex flex-col bg-slate-900">
			
			<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				{t("game.liveTitle")}
			</CardTitle>

			<span className="text-xs text-white/50 absolute top-6 right-6 z-10">
				{t("game.liveCount", { count: games.playing.length })}
			</span>

			<div className="flex-1 flex flex-col mt-16 px-4 overflow-y-auto gap-3 max-h-105">
				
			{games.playing.map((game) => (	
				<div
				key={game.gameId}
				className="flex items-center justify-between p-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 transition hover:scale-[1.01]">

					<div className="flex items-center gap-3">
						<div className="flex items-center -space-x-2">
							<Avatar
							src={game.playerX?.avatar || undefined}
							fallback={game.playerX?.username?.[0] || "?"}
							/>

							<Avatar
							src={game.playerO?.avatar || undefined}
							fallback={game.playerO?.username?.[0] || "?"}
							/>
						</div>
						
						<div>
							<p>
								{game.playerX?.username || "?"}
									{" "}
									{t("game.vs")}
									{" "}
								{game.playerO?.username || "?"}
							</p>

							<p className="text-xs text-white/60">
								{t("game.playing")}
							</p>
						</div>
					</div>

					<Button
					onClick={() => navigate(`/game/${game.gameId}`)}>
						{t("game.watch")}
					</Button>
				</div>
			))}
			</div>
		</Card>
	)
	}

	if (!user) {
	return (
		<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
			<EmptyStateCard
				title={t("game.liveTitle")}
				icon={<Binoculars size={24} />}
				message={t("game.notConnected")}
				description={t("game.liveLogin")}
				className="min-h-80 bg-slate-900"
				actions={
					<Button
					onClick={() => navigate("/")}>
						{t("buttons.backHome")}
					</Button>
				}
			/>
		</section>

		)
	}

	return (
		<section className="w-full max-w-3xl mx-auto px-6 py-10">
			{renderPlayingGames()}
		</section>
	);
}
