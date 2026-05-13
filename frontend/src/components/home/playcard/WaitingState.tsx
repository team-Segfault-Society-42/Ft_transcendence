import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "lucide-react";


interface Props {
	gameId: string;
    onCancel: () => void;
}

export function WaitingState({ gameId, onCancel }: Props) {

	const inviteLink = `${window.location.origin}/game/${gameId}`;

	return (
		<Card className="h-full relative flex items-center justify-center bg-slate-900">

			<CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				Waiting Lobby
			</CardTitle>

			<div className="flex flex-col items-center gap-6 w-full px-6">

                <Loader
				size={72}
				className="mx-auto text-cyan-400 animate-pulse"
				/>

				<div className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />

					<p className="text-white/80">
						Waiting for an opponent to join...
					</p>
				</div>

				<input
					value={inviteLink}
					readOnly
					className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
				/>

				<div className="flex gap-4 w-full">

					<Button
						className="flex-1"
						onClick={() =>
							navigator.clipboard.writeText(inviteLink)
						}
					>
						Copy Link
					</Button>

					<Button
						variant="danger"
						className="flex-1"
                        onClick={onCancel}
					>
						Cancel
					</Button>
				</div>
			</div>
		</Card>
	);
}