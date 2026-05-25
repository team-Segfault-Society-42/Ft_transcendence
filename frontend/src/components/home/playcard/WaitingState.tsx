import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
	gameId: string;
    onCancel: () => void;
}

/**
 * Displays the waiting lobby state after a game
 * has been created.
 *
 * Shows:
 * - the invite link
 * - the waiting status
 * - actions to copy or cancel the game
 */
export function WaitingState({ gameId, onCancel }: Props) {

	const inviteLink = `${window.location.origin}/game/${gameId}`;
	const { t } = useTranslation();

	return (
		<Card className="h-full relative flex items-center justify-center bg-slate-900">

			{/* CARD HEADER */}
			<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				{t("home.play.waiting.title")}
			</CardTitle>

			{/* WAITING CONTENT */}
			<div className="flex flex-col items-center gap-6 w-full px-6">

				{/* ICON */}
                <Loader
				size={72}
				className="mx-auto text-cyan-400 animate-spin animation-duration-[4s]"
				/>

				{/* WAITING STATUS */}
				<div className="flex items-center gap-2">

					{/* DESCRIPTION */}
					<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

					<p className="text-white/80">
						{t("home.play.waiting.description")}
					</p>
				</div>

				{/* INVITE LINK */}
				<input
					value={inviteLink}
					readOnly
					className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
				/>

				{/* ACTION BUTTONS */}
				<div className="flex gap-4 w-full">

					{/* COPY LINK */}
					<Button
						className="flex-1"
						onClick={() =>
							navigator.clipboard.writeText(inviteLink)
						}
					>
						{t("home.play.waiting.copy")}
					</Button>

					{/* CANCEL GAME */}
					<Button
						variant="danger"
						className="flex-1"
                        onClick={onCancel}
					>
						{t("home.play.waiting.cancel")}
					</Button>
				</div>
			</div>
		</Card>
	);
}