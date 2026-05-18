import { Card, CardTitle } from "@/components/ui/Card"
import { useTranslation } from "react-i18next";
import { GameRules } from "../../ui/GameRules";
import { useActiveGameStore } from "@/Store/activeGameStore";
import { gameApi } from "@/services/gameApi";
import { IdleState } from "./IdleState";
import { WaitingState } from "./WaitingState";
import { PlayingState } from "./PlayingState";

type Props = {
  	user: any
}

export function PlayCard({ user }: Props) {
    const { t } = useTranslation();
    const activeGame = useActiveGameStore((state) => state.activeGame);	

    const createGame = async () => {
      	try {
        	await gameApi.createGame();
		}
      	catch (error) {
        	console.error(error);
      	}
    };
	
	const handleCancelGame = async () => {
		try {
			if (!activeGame?.gameId)
				return;
			await gameApi.leaveGame(activeGame.gameId);
		}
		catch (error) {
			console.error(
				"Failed to cancel game:",
				error
			);
		}
	};

    if (!user) {
    	return (
      		<Card className="min-h-120 relative flex flex-col bg-slate-900">
        		<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          			{t("game.howToPlay")}
        		</CardTitle>

        		<div className="flex justify-center pt-15 pb-8 px-6">
          			<GameRules/>
        		</div>
      		</Card>
    	)
  	}

  	if (activeGame?.status === "waiting") {
		return (
			<WaitingState
				gameId={activeGame.gameId}
				onCancel={handleCancelGame}
			/>
		)
  	}
  
	if (activeGame?.status === "playing") {
		return (
			<PlayingState
			gameId={activeGame.gameId}
			playerX={activeGame.playerX}
			playerO={activeGame.playerO}
			/>
		)
	}

  	return (
    	<IdleState
			createGame={createGame}
	  	/>
  	)
}