import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

interface Props {
	createGame: () => void;
}

export function IdleState({ createGame }: Props) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<Card className="h-full relative flex items-center justify-center bg-slate-900">

			<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				{t("home.play.title")}
			</CardTitle>

			<div className="flex flex-col gap-4 w-full px-6">

				<Gamepad2
				size={72}
				className="mx-auto text-cyan-400"
				/>

				<p className="text-white/60 text-sm text-center max-w-sm leading-relaxed mb-6">
					Jump into competitive matches or spectate games live.
				</p>


				<div className="flex flex-col gap-4 w-full">
					<Button onClick={createGame}>
						Create Lobby
					</Button>

					<Button
						onClick={() => navigate("/play")}
					>
						Join Game
					</Button>

					<Button
						onClick={() => navigate("/spectate")}
					>
						Watch Games
					</Button>
				</div>
			</div>
		</Card>
	);
}