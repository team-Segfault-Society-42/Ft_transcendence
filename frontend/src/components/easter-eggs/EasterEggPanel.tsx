import { RickTerminal } from "./RickTerminal";
import { MatrixEffect } from "./MatrixEffect";
import { NeofetchCard } from "./NeofetchCard";
import { Nuke } from "./Nuke";

export type EasterEgg = "rick" | "matrix" | "neofetch" | "nuke";

type EasterEggPanelProps = {
	type: EasterEgg;
	onClose: () => void;
};

export function EasterEggPanel({ type, onClose }: EasterEggPanelProps) {
	if (type === "rick") {
		return <RickTerminal onClose={onClose} />;
	}

	if (type === "matrix") {
		return (
			<>
				<MatrixEffect />

				<button
					type="button"
					onClick={onClose}
					className="fixed right-6 top-6 z-[10000] rounded-xl border border-green-500/30 bg-black px-4 py-2 font-mono text-sm text-green-400 hover:bg-green-500/10"
				>
					exit
				</button>
			</>
		);
	}

	if (type === "neofetch") {
		return <NeofetchCard onClose={onClose} />;
	}

	if (type === "nuke") {
		return <Nuke onClose={onClose} />;
	}

	return null;
}
