import { useEffect, useMemo, useRef, useState } from "react";

type RickTerminalProps = {
	onClose: () => void;
};

const FRAME_INTERVAL_MS = 90;

/**
 * Splits ANSI terminal animation text into clean frames.
 *
 * @param text - Raw ANSI text loaded from the public rick.txt file.
 * @returns Clean terminal frames.
 */
function splitAnsiFrames(text: string): string[] {
	return text
		.split(/\x1b\[2J\x1b\[H/g)
		.map((frame) =>
			frame
				.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "")
				.trimEnd(),
		)
		.filter((frame) => frame.trim().length > 0);
}

/**
 * Displays a fullscreen Rick terminal animation with optional audio.
 *
 * @param onClose - Callback used to close the overlay.
 * @returns Fullscreen Rick easter egg.
 */
export function RickTerminal({ onClose }: RickTerminalProps) {
	const [frames, setFrames] = useState<string[]>([]);
	const [frameIndex, setFrameIndex] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		async function loadFrames(): Promise<void> {
			const response = await fetch("/easter-eggs/rick.txt");
			const text = await response.text();

			setFrames(splitAnsiFrames(text));
		}

		loadFrames().catch((error: unknown) => {
			if (import.meta.env.DEV) {
				console.error("Failed to load Rick frames:", error);
			}
		});
	}, []);

	useEffect(() => {
		if (frames.length === 0) return;

		const interval = window.setInterval(() => {
			setFrameIndex((current) => (current + 1) % frames.length);
		}, FRAME_INTERVAL_MS);

		return () => window.clearInterval(interval);
	}, [frames.length]);

	useEffect(() => {
		const audio = new Audio("/sounds/rick-8bit.mp3");

		audio.loop = true;
		audio.volume = 0.25;
		audioRef.current = audio;

		audio.play().catch(() => {
			// Browser may block autoplay until user interaction.
		});

		return () => {
			audio.pause();
			audio.currentTime = 0;
		};
	}, []);

	const frame = useMemo(() => {
		return frames[frameIndex] ?? "Loading Rick...";
	}, [frames, frameIndex]);

	return (
		<div className="fixed inset-0 z-[9999] overflow-hidden bg-black text-white">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18),transparent_45%)]" />

			<div className="absolute left-6 top-6 z-10 rounded-xl border border-pink-500/30 bg-black/80 px-4 py-3 font-mono text-sm">
				<p className="text-pink-300">ascii.live/rick</p>
				<p className="text-white/40">Never gonna give you up...</p>
			</div>

			<button
				type="button"
				onClick={onClose}
				className="absolute right-6 top-6 z-10 rounded-xl border border-pink-500/30 bg-black/80 px-4 py-2 font-mono text-sm text-pink-300 hover:bg-pink-500/10"
			>
				exit
			</button>

			<div className="relative z-0 flex h-full items-center justify-center">
				<pre className="max-h-[92vh] max-w-[96vw] overflow-hidden whitespace-pre font-mono text-[10px] leading-[10px] text-pink-300 drop-shadow-[0_0_12px_rgba(236,72,153,0.65)] sm:text-xs sm:leading-3 lg:text-sm lg:leading-4">
					{frame}
				</pre>
			</div>
		</div>
	);
}
