import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useLiveGamesStore } from "@/Store/liveGamesStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router";
import { useTranslation } from "react-i18next";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { EyeOff, Binoculars } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import type { User } from "@/type/user.types";
import { Username } from "@/components/ui/Username";

export default function LiveGamesDisplay() {

  	const navigate = useNavigate();
  	const { games, loading } = useLiveGamesStore();
  	const fetchGames = useLiveGamesStore((state) => state.fetchGames);
  	const [user] = useOutletContext<[User | null]>()
  	const { t } = useTranslation()


	useEffect(() => {
		if (!user)
			return;
		fetchGames();
	}, [fetchGames]);

	{/* NOT CONNECTED CARD */}
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

	{/* LOADING STATE */}
	if (loading) {
		return (
		<div className="w-full flex justify-center items-center py-10 text-white">
			<Spinner size="lg" />
		</div>
		);
	}

  	function renderPlayingGames() {

	{/* CARD EMPTY */}
    if (games.playing.length === 0) {
		return (
			<EmptyStateCard
			title={t("game.liveTitle")}
			icon={<EyeOff size={24} />}
			message={t("game.liveEmpty")}
			description={t("game.liveDesc")}
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
		<Card className="min-h-80 h-full relative flex flex-col bg-slate-900">
			
			{/* CARD HEADER */}
			<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				{t("game.liveTitle")}
			</CardTitle>

			{/* LIVE GAMES COUNTER */}
			<span className="text-xs text-white/50 mt-8">
				{t("game.liveCount", { count: games.playing.length })}
			</span>

			{/* PLAYING GAMES LIST */}
			<div className="flex-1 flex flex-col mt-16 px-4 overflow-y-auto gap-3 max-h-105">
				
			{games.playing.map((game) => (	
				<div
				key={game.gameId}
				className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 transition hover:scale-[1.01]">

					{/* PLAYERS SECTION */}
					<div className="flex items-center gap-3 min-w-0">
						<div className="hidden sm:flex items-center -space-x-2 shrink-0">
							<Avatar
							src={game.playerX?.avatar || undefined}
							fallback={game.playerX?.username?.[0] || "?"}
							/>

							<Avatar
							src={game.playerO?.avatar || undefined}
							fallback={game.playerO?.username?.[0] || "?"}
							/>
						</div>
						
						<div className="min-w-0">
							<p className="text-xs sm:text-base gap-1">
								<Username
								name={game.playerX?.username || "?"}
								variant="card"
								/>
									{" "}
									{t("game.vs")}
									{" "}
								<Username
								name={game.playerO?.username || "?"}
								variant="card"
								/>
							</p>

							<p className="text-xs text-white/60">
								{t("game.playing")}
							</p>
						</div>
					</div>

					{/* SPECTATE BUTTON */}
					<Button
					onClick={() => navigate(`/game/${game.gameId}`)}
					className="text-xs sm:text-md shrink-0">
						{t("game.watch")}
					</Button>
				</div>
			))}
			</div>
		</Card>
	)
	}

	return (
		<section className="w-full max-w-3xl mx-auto px-6 py-10">
			{renderPlayingGames()}
		</section>
	);
}
