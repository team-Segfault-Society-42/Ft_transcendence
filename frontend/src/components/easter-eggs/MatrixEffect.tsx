import { useEffect, useMemo, useState } from "react";

type MatrixEffectProps = {
	onClose: () => void;
};

type MatrixColumn = {
	id: number;
	left: string;
	duration: number;
	delay: number;
	text: string;
};

const matrixCharacters = "アァイィウヴエカキクケコサシスセソタチツテト01";
const MATRIX_COLUMN_COUNT = 26;
const MATRIX_COLUMN_LENGTH = 18;
const MATRIX_DURATION_MS = 9000;

/**
 * Generates one falling Matrix text column.
 *
 * @returns Randomized Matrix-style text column.
 */
function createRandomColumnText(): string {
	return Array.from({ length: MATRIX_COLUMN_LENGTH })
		.map(
			() =>
				matrixCharacters[
					Math.floor(Math.random() * matrixCharacters.length)
				],
		)
		.join("\n");
}

/**
 * Builds randomized Matrix animation columns once per overlay mount.
 *
 * @returns Matrix column metadata used by the animated overlay.
 */
function createMatrixColumns(): MatrixColumn[] {
	return Array.from({ length: MATRIX_COLUMN_COUNT }).map((_, index) => ({
		id: index,
		left: `${(index / MATRIX_COLUMN_COUNT) * 100}%`,
		duration: 2 + Math.random() * 3,
		delay: Math.random() * 2,
		text: createRandomColumnText(),
	}));
}

/**
 * Displays a fullscreen Matrix-style easter egg overlay.
 *
 * @param onClose - Callback used to close the overlay.
 * @returns Fullscreen Matrix animation.
 */
export function MatrixEffect({ onClose }: MatrixEffectProps) {
	const columns = useMemo(() => createMatrixColumns(), []);
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setVisible(false);
		}, MATRIX_DURATION_MS);

		return () => window.clearTimeout(timeout);
	}, []);

	if (!visible) {
		return (
			<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black font-mono">
				<div className="rounded-xl border border-green-500/20 bg-black p-4 text-center text-xs text-green-400">
					Matrix signal lost.
				</div>

				<button
					type="button"
					onClick={onClose}
					className="fixed right-6 top-6 z-[10000] rounded-xl border border-green-500/30 bg-black px-4 py-2 font-mono text-sm text-green-400 hover:bg-green-500/10"
				>
					exit
				</button>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[9999] overflow-hidden bg-black/95 font-mono text-green-400">
			<div className="absolute left-4 top-4 z-10 rounded-lg border border-green-500/30 bg-black/80 px-3 py-2 text-xs">
				<p className="text-green-300">Wake up, transcender...</p>
				<p className="text-green-500/60">Press close to exit the matrix.</p>
			</div>

			<button
				type="button"
				onClick={onClose}
				className="fixed right-6 top-6 z-[10000] rounded-xl border border-green-500/30 bg-black px-4 py-2 font-mono text-sm text-green-400 hover:bg-green-500/10"
			>
				exit
			</button>

			{columns.map((column) => (
				<pre
					key={column.id}
					className="absolute top-[-60%] whitespace-pre text-sm leading-5 opacity-80"
					style={{
						left: column.left,
						animation: `matrix-fall ${column.duration}s linear ${column.delay}s infinite`,
					}}
				>
					{column.text}
				</pre>
			))}

			<style>
				{`
					@keyframes matrix-fall {
						from { transform: translateY(-100%); }
						to { transform: translateY(180vh); }
					}
				`}
			</style>
		</div>
	);
}
