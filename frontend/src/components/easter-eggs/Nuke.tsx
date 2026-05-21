import { useEffect, useState } from "react";

type NukeProps = {
	onClose: () => void;
};

const lines = [
	"$ make nuke",
	"⚠️  This will destroy all containers, images, and volumes for this stack,",
	"   AND:",
	"   - The .env file",
	"   - All secret files",
	"   - All Postgres data",
	"Continue? [y/N] y",
	"",
	"Remove postgres:16? Skip if rebuilding soon [y/N] y",
	"<Removing postgres:16>",
	"",
	"<Stopping stack and removing containers + volumes>",
	"docker compose -p dev down --volumes --remove-orphans",
	"docker compose -p prod down --volumes --remove-orphans",
	"Deleted volumes. Deleted containers. Deleted excuses.",
	"",
	"<Removing images built by this stack>",
	"docker compose -p dev down --rmi local",
	"docker compose -p prod down --rmi local",
	"",
	"<Clearing all build cache>",
	"docker buildx prune -f",
	"",
	"<Removing .env and secret files>",
	"rm -f .env.dev .env.prod secrets/*",
	"",
	"Task completed. Everything is gone.",
	"Run `make up` to rebuild from scratch.",
	"",
	"docker system df",
	"",
	"System shutting down...",
];

export function Nuke({ onClose }: NukeProps) {
	const [visibleLines, setVisibleLines] = useState(1);
	const [shutdown, setShutdown] = useState(false);
	const [dot, setDot] = useState(false);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setVisibleLines((current) => {
				if (current >= lines.length) {
					window.clearInterval(interval);
					window.setTimeout(() => setShutdown(true), 900);
					return current;
				}

				return current + 1;
			});
		}, 300);

		return () => window.clearInterval(interval);
	}, []);

	useEffect(() => {
		if (!shutdown) return;

		const timeout = window.setTimeout(() => setDot(true), 700);
		return () => window.clearTimeout(timeout);
	}, [shutdown]);

	return (
		<div className="fixed inset-0 z-[9999] overflow-hidden bg-black font-mono text-sm text-white">
			<button
				type="button"
				onClick={onClose}
				className="absolute right-6 top-6 z-20 rounded-xl border border-white/20 bg-black px-4 py-2 text-xs text-white/70 hover:text-red-400"
			>
				exit
			</button>

			<div
				className={`absolute inset-0 z-10 bg-black transition-all duration-700 ${
					shutdown ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			>
				<div className="relative flex h-full items-center justify-center">
					{dot && (
						<div className="h-2 w-2 rounded-full bg-white shadow-[0_0_40px_20px_rgba(255,255,255,0.45)] animate-pulse" />
					)}

					<div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/30 shadow-[0_0_30px_rgba(255,255,255,0.8)] animate-pulse" />
				</div>
			</div>

			<div className="mx-auto flex h-full max-w-5xl flex-col justify-center px-8">
				<div className="mb-4 text-xs text-white/40">
					~/Ft_transcendence/Makefile
				</div>

				<div className="rounded-2xl border border-cyan-500/20 bg-slate-950/80 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
					{lines.slice(0, visibleLines).map((line, index) => (
						<p
							key={`${line}-${index}`}
							className={
								line.startsWith("$")
									? "text-cyan-300"
									: line.includes("⚠️") || line.includes("AND:")
										? "text-orange-300"
										: line.includes("Everything is gone")
											? "text-red-400"
											: line.includes("<")
												? "text-pink-300"
												: line.includes("Run")
													? "text-green-400"
													: "text-white/70"
							}
						>
							{line || "\u00A0"}
						</p>
					))}

					{visibleLines < lines.length && (
						<span className="mt-2 inline-block h-4 w-2 animate-pulse bg-white/70" />
					)}
				</div>
			</div>
		</div>
	);
}
