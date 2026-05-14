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

				<p className="text-white/80 text-sm text-center max-w-sm leading-relaxed mb-6">
					{t("home.play.description")}
				</p>


				<div className="flex flex-col gap-4 w-full">
					<Button onClick={createGame}>
						{t("home.buttons.create")}
					</Button>

					<Button
						onClick={() => navigate("/play")}
					>
						{t("home.buttons.join")}
					</Button>

					<Button
						onClick={() => navigate("/spectate")}
					>
						{t("home.buttons.watch")}
					</Button>
				</div>
			</div>
		</Card>
	);
}