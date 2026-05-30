import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Username } from "@/components/ui/Username";

interface Props {
	gameId: string;

	playerX?: {
		username: string;
		avatar?: string;
	};

	playerO?: {
		username: string;
		avatar?: string;
	};
}

/**
 * Displays the active multiplayer game state.
 *
 * Shows:
 * - both players information
 * - current playing status
 * - a button to resume the live match
 */
export function PlayingState({ gameId, playerX, playerO }: Props) {

	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<Card className="h-full relative flex items-center justify-center bg-slate-900 overflow-hidden">

			{/* CARD HEADER */}
			<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				{t("home.play.playing.title")}
			</CardTitle>

			{/* PLAYING CONTENT */}
			<div className="flex flex-col items-center justify-center gap-8 w-full px-6">

				{/* ICON */}
				<Swords
				size={72}
				className="mx-auto mt-12 text-cyan-400 animate-ping animation-duration-[3s]"
				/>

				{/* DESCRIPTION */}
				<p className="text-white/80 text-sm text-center max-w-sm leading-relaxed mb-6">
					{t("home.play.playing.description")}
				</p>

				{/* PLAYERS SECTION */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-6">

					{/* PLAYER X */}
					<div className="flex flex-1 flex-col items-center gap-3 min-w-0">
						<Avatar
							src={playerX?.avatar}
							fallback={
								playerX?.username?.[0] || "X"
							}
							size="lg"
						/>

						<Username
							name={playerX?.username || "Player X"}
							variant="card"
							className="text-white font-medium text-center"
						/>
					</div>

					{/* VS SECTION */}
					<div className="flex flex-col items-center shrink-0">
						<p className="text-3xl font-black bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
							{t("home.play.playing.vs")}
						</p>
					</div>

					{/* PLAYER O */}
					<div className="flex flex-col flex-1 items-center gap-3 min-w-0">
						<Avatar
							src={playerO?.avatar}
							fallback={
								playerO?.username?.[0] || "O"
							}
							size="lg"
						/>

						<Username
							name={playerO?.username || "Player O"}
							variant="card"
							className="text-white font-medium text-center"
						/>
					</div>
				</div>

				{/* ACTION BUTTONS */}
				<div className="flex flex-col gap-4 w-full">

					{/* RESUME GAME */}
					<Button
						className="w-full"
						onClick={() =>
							navigate(`/game/${gameId}`)
						}
					>
						{t("home.play.playing.resume")}
					</Button>
				</div>
			</div>
		</Card>
	);
}