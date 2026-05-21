import { useEffect, useMemo, useState } from "react";

const chars = "アァイィウヴエカキクケコサシスセソタチツテト01";

function randomColumn() {
	return Array.from({ length: 18 })
		.map(() => chars[Math.floor(Math.random() * chars.length)])
		.join("\n");
}

export function MatrixEffect() {
	const columns = useMemo(
		() =>
			Array.from({ length: 26 }).map((_, index) => ({
				id: index,
				left: `${(index / 26) * 100}%`,
				duration: 2 + Math.random() * 3,
				delay: Math.random() * 2,
				text: randomColumn(),
			})),
		[],
	);

	const [visible, setVisible] = useState(true);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setVisible(false);
		}, 9000);

		return () => window.clearTimeout(timeout);
	}, []);

	if (!visible) {
		return (
			<div className="rounded-xl border border-green-500/20 bg-black p-4 text-center text-xs text-green-400">
				Matrix signal lost.
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-[9999] overflow-hidden bg-black/95 font-mono text-green-400">
			<div className="absolute left-4 top-4 z-10 rounded-lg border border-green-500/30 bg-black/80 px-3 py-2 text-xs">
				<p className="text-green-300">Wake up, transcender...</p>
				<p className="text-green-500/60">Press close to exit the matrix.</p>
			</div>

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
