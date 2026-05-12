import { History as HistoryIcon, Plus, Users } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useLiveGamesStore } from "@/Store/liveGamesStore";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";

interface User {
  	username: string;
  	avatar?: string;
  	bio?: string;
  	wins?: number;
  	losses?: number;
  	draws?: number;
  	xp?: number;
}

export default function Play() {
	
  	const { t } = useTranslation();
  	const [user] = useOutletContext<[User | null]>();
  	const navigate = useNavigate();
  	const fetchGames = useLiveGamesStore((state) => state.fetchGames);
  	const [createdGameId, setCreatedGameId] = useState<string | null>(null);
	const { games, loading } = useLiveGamesStore();

  	const inviteLink = createdGameId
    	? `${window.location.origin}/game/${createdGameId}`
    	: "";

  	async function handleCreateGame() {
    	try {
      		const response = await fetch("/api/game/create", {
        	method: "POST",
      		});

      		if (!response.ok) {
        		throw new Error(`HTTP error ${response.status}`);
      		}

      		const data: { gameId: string } = await response.json();

      		setCreatedGameId(data.gameId);

      		await fetchGames();
    	} catch (error) {
      		console.error("Failed to create game:", error);
    	}
  	}

  	async function handleCopyLink() {
    	try {
      		await navigator.clipboard.writeText(inviteLink);
    	} catch (error) {
      		console.error("Failed to copy link:", error);
    	}
  	}

  	async function handleCancelGame() {
    	if (!createdGameId)
			return;

  		try {
    		const response = await fetch(`/api/game/${createdGameId}/leave`, {
      			method: "POST",
    		});

			if (!response.ok) {
				throw new Error(`HTTP error ${response.status}`);
			}
    		setCreatedGameId(null);
   			await fetchGames();
  		} catch (error) {
    		console.error("Failed to cancel game:", error);
  		}
  	}

	useEffect(() => {
		async function fetchActiveGame() {
			try {
				const response = await fetch("/api/game/active");
				if (!response.ok){
					return;
				}
	  
				const text = await response.text();
				if (!text) {
  					return;
				}
				const data = JSON.parse(text);
				if (!data) {
					return;
				}

				if (data?.gameId && data.status === "waiting") {
			  		setCreatedGameId(data.gameId);
				}

				if (data.status === "playing") {
        			clearInterval(interval);
					navigate(`/game/${data.gameId}`);
				}
			} catch (error) {
				console.error("Failed to fetch active game:", error);
			}
		}
	  
		fetchActiveGame();

		const interval = setInterval(
			fetchActiveGame,
			1500
		  );	
		  return () => clearInterval(interval);

	}, [navigate]);
	
	useEffect(() => {
		fetchGames();
	}, [fetchGames]);

  	if (!user) {
		return (
		<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
			<EmptyStateCard
			title={t("game.title")}
			icon={<HistoryIcon size={24} />}
			message={t("game.notConnected")}
			description={t("game.login")}
			actions={
				<Button onClick={() => navigate("/")}>
				{t("buttons.backHome")}
				</Button>
			}
			/>
		</section>
		);
  	}

  	return (
    <section className="w-full max-w-5xl mx-auto px-6 py-10">
      	<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        	{/* MY GAMES */}
        	<Card className="h-full relative flex items-center justify-center bg-slate-900">
          		<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            		{t("play.myGames.title")}
          		</CardTitle>

          		<div className="mt-15 flex flex-col gap-6">
            	{!createdGameId ? (
              <>
                {/* CREATE GAME */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Plus className="text-cyan-400" size={20} />

                    <p className="font-medium text-white">
                      {t("play.myGames.subtitle")}
                    </p>
                  </div>

                  <p className="text-sm text-white/50 mb-6">
                    {t("play.myGames.desc")}
                  </p>

                  <Button
                    className="w-full"
                    onClick={handleCreateGame}
                  >
                    {t("play.myGames.create")}
                  </Button>
                </div>

                {/* EMPTY */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-white/30 text-sm italic text-center">
                    {t("play.myGames.empty")}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-white/5 border border-cyan-500/20 rounded-xl p-6">
                <p className="text-center text-white font-medium mb-2">
                  {t("play.myGames.waiting")}
                </p>

                <p className="text-center text-sm text-white/50 mb-6">
                  {t("play.myGames.share")}
                </p>

                <div className="flex gap-4 mb-6">
                  <input
                    value={inviteLink}
                    readOnly
                    className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-2 text-white outline-none"
                  />

                  <Button onClick={handleCopyLink}>
                    {t("play.myGames.copy")}
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="danger"
                    onClick={handleCancelGame}
                  >
                    {t("play.myGames.cancel")}
                  </Button>
                </div>
              </div>
            )}
          	</div>
        	</Card>

        {/* AVAILABLE GAMES */}
        <Card className="h-full relative flex items-center justify-center bg-slate-900">
          	<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            	{t("play.availGames.title")}
          	</CardTitle>

          	<div className="mt-15 flex flex-col gap-6">
            {/* PUBLIC GAMES */}
            	<div className="bg-white/5 border border-white/10 rounded-xl p-6">
              		<div className="flex items-center gap-3 mb-4">
                		<Users className="text-pink-400" size={20} />

                		<p className="font-medium text-white">
							{t("play.availGames.subtitle")}
                		</p>
              		</div>

             		<p className="text-sm text-white/50 mb-6">
						{t("play.availGames.desc")}
              		</p>

              		<Button
                	variant="secondary"
					className="w-full"
					onClick={fetchGames}
					>
               			{t("play.availGames.refresh")}
              		</Button>
            	</div>

            {/* LOADING */}
			{loading && (
				<div className="flex justify-center py-6">
					<Spinner size="lg" />
				</div>
			)}

			{/* EMPTY */}
			{!loading && games.waiting.length === 0 && (
				<div className="bg-white/5 border border-white/10 rounded-xl p-6">
					<p className="text-white/30 text-sm italic text-center">
						{t("play.availGames.empty")}
					</p>
				</div>
			)}

			{/* GAMES */}
			{!loading && games.waiting.map((game) => (
				<div
				key={game.gameId}
				className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between gap-4"
				>
					<div className="flex items-center gap-4">
						<Avatar
						src={game.playerX?.avatar || undefined}
						fallback={game.playerX?.username?.[0] || "?"}
						size="md"
						/>

						<div>
							<p className="text-white font-medium">
								{game.playerX?.username}
							</p>

							<p className="text-sm text-white/50">
								{t("play.availGames.waiting")}
							</p>
						</div>
					</div>

					<Button
					onClick={() => navigate(`/game/${game.gameId}`)}
					>
						{t("play.availGames.join")}
					</Button>
				</div>
			))}
          </div>
        </Card>
      </div>
    </section>
  );
}