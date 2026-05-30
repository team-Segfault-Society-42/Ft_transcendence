import { MatrixEffect } from "./MatrixEffect";
import { NeofetchCard } from "./NeofetchCard";
import { Nuke } from "./Nuke";
import { RickTerminal } from "./RickTerminal";

export type EasterEgg = "rick" | "matrix" | "neofetch" | "nuke";

type EasterEggPanelProps = {
	type: EasterEgg;
	onClose: () => void;
};

/**
 * Renders the selected local easter egg overlay.
 *
 * @param type - Easter egg command selected from the chat input.
 * @param onClose - Callback used to close the overlay.
 * @returns Fullscreen easter egg overlay.
 */
export function EasterEggPanel({ type, onClose }: EasterEggPanelProps) {
	if (type === "rick") {
		return <RickTerminal onClose={onClose} />;
	}

	if (type === "matrix") {
		return <MatrixEffect onClose={onClose} />;
	}

	if (type === "neofetch") {
		return <NeofetchCard onClose={onClose} />;
	}

	if (type === "nuke") {
		return <Nuke onClose={onClose} />;
	}

	return null;
}
