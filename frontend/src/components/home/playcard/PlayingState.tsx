import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useNavigate } from "react-router-dom";

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

export function PlayingState({ gameId, playerX, playerO }: Props) {

	const navigate = useNavigate();

	return (
		<Card className="h-full relative flex items-center justify-center bg-slate-900 overflow-hidden">

			<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				Current Match
			</CardTitle>

			<div className="flex flex-col items-center justify-center gap-8 w-full px-6">

				<div className="flex items-center justify-center gap-6">

					<div className="flex flex-col items-center gap-3">
						<Avatar
							src={playerX?.avatar}
							fallback={
								playerX?.username?.[0] || "X"
							}
							size="lg"
						/>

						<p className="text-white font-medium">
							{playerX?.username}
						</p>
					</div>

					<div className="flex flex-col items-center">
						<p className="text-3xl font-black bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
							VS
						</p>

						<div className="w-16 h-px bg-white/10 mt-2" />
					</div>

					<div className="flex flex-col items-center gap-3">
						<Avatar
							src={playerO?.avatar}
							fallback={
								playerO?.username?.[0] || "O"
							}
							size="lg"
						/>

						<p className="text-white font-medium">
							{playerO?.username}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-4 w-full">

					<Button
						className="w-full"
						onClick={() =>
							navigate(`/game/${gameId}`)
						}
					>
						Resume Match
					</Button>

					<Button
						variant="secondary"
						className="w-full"
						onClick={() => navigate("/spectate")}
					>
						Watch Games
					</Button>
				</div>
			</div>
		</Card>
	);
}