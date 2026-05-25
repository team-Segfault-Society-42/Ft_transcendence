import { Card, CardTitle } from "@/components/ui/Card"
import { useTranslation } from "react-i18next";
import { GameRules } from "../../ui/GameRules";
import { useActiveGameStore } from "@/Store/activeGameStore";
import { gameApi } from "@/services/gameApi";
import { IdleState } from "./IdleState";
import { WaitingState } from "./WaitingState";
import { PlayingState } from "./PlayingState";
import type { User } from "@/type/user.types";

type Props = {
  	user: User | null
}

/**
 * Displays the main homepage play card.
 *
 * Renders different states depending on:
 * - authentication status
 * - active game status
 *
 * Possible states:
 * - rules card when no user is connected
 * - waiting lobby state
 * - active playing state
 * - default idle state
 */
export function PlayCard({ user }: Props) {
    const { t } = useTranslation();
    const activeGame = useActiveGameStore((state) => state.activeGame);	

	/**
	 * Creates a new multiplayer game.
	 *
	 * @returns Promise resolved when the game
	 * creation request is completed.
	 */
    const createGame = async () => {
      	try {
        	await gameApi.createGame();
		}
      	catch (error: unknown) {
        	console.error(error);
      	}
    };
	
	/**
	 * Cancels the currently active waiting game.
	 *
	 * @returns Promise resolved when the game
	 * cancellation request is completed.
	 */
	const handleCancelGame = async () => {
		try {
			if (!activeGame?.gameId)
				return;
			await gameApi.leaveGame(activeGame.gameId);
		}
		catch (error: unknown) {
			console.error(
				"Failed to cancel game:",
				error
			);
		}
	};

	{/* GUESS STATE CARD */}
    if (!user) {
    	return (
      		<Card className="min-h-120 relative flex flex-col bg-slate-900">
				{/* CARD HEADER */}
        		<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          			{t("game.howToPlay")}
        		</CardTitle>

				{/* GAME RULES */}
        		<div className="flex justify-center pt-15 pb-8 px-6">
          			<GameRules/>
        		</div>
      		</Card>
    	)
  	}

	{/* WAITING GAME STATE */}
  	if (activeGame?.status === "waiting") {
		return (
			<WaitingState
				gameId={activeGame.gameId}
				onCancel={handleCancelGame}
			/>
		)
  	}
  
	{/* PLAYING GAME STATE */}
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