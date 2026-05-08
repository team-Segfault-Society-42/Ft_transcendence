import { History as HistoryIcon, Plus, Users } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useLiveGamesStore } from "@/Store/liveGamesStore";

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
    		await fetch(`/api/game/${createdGameId}/leave`, {
      			method: "POST",
    		});
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
	  
				if (!response.ok)
			  		return;
	  
				const data = await response.json();
	  
				if (data?.gameId && data.status === "waiting") {
			  		setCreatedGameId(data.gameId);
				}
			} catch (error) {
				console.error("Failed to fetch active game:", error);
			}
		}
	  
		fetchActiveGame();
	}, []);
	
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
            		My Games
          		</CardTitle>

          		<div className="mt-8 flex flex-col gap-6">
            	{!createdGameId ? (
              <>
                {/* CREATE GAME */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Plus className="text-cyan-400" size={20} />

                    <p className="font-medium text-white">
                      Create a new game
                    </p>
                  </div>

                  <p className="text-sm text-white/50 mb-6">
                    Create a lobby and invite another player.
                  </p>

                  <Button
                    className="w-full"
                    onClick={handleCreateGame}
                  >
                    Create Game
                  </Button>
                </div>

                {/* EMPTY */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <p className="text-white/30 text-sm italic text-center">
                    No active games
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-white/5 border border-cyan-500/20 rounded-xl p-6">
                <p className="text-center text-white font-medium mb-2">
                  Waiting for opponent to join...
                </p>

                <p className="text-center text-sm text-white/50 mb-6">
                  Share this link to invite someone:
                </p>

                <div className="flex gap-4 mb-6">
                  <input
                    value={inviteLink}
                    readOnly
                    className="flex-1 bg-transparent border border-white/10 rounded-xl px-4 py-2 text-white outline-none"
                  />

                  <Button onClick={handleCopyLink}>
                    Copy
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="danger"
                    onClick={handleCancelGame}
                  >
                    Cancel Game
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* AVAILABLE GAMES */}
        <Card className="relative bg-slate-900 border-white/10 p-6">
          <CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            Available Games
          </CardTitle>

          <div className="mt-8 flex flex-col gap-6">
            {/* PUBLIC GAMES */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-pink-400" size={20} />

                <p className="font-medium text-white">
                  Public games
                </p>
              </div>

              <p className="text-sm text-white/50 mb-6">
                Join a waiting lobby created by another player.
              </p>

              <Button
                variant="secondary"
                className="w-full"
                onClick={fetchGames}
              >
                Refresh Games
              </Button>
            </div>

            {/* EMPTY */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-white/30 text-sm italic text-center">
                No available games
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}