type NeofetchCardProps = {
	onClose: () => void;
};

export function NeofetchCard({ onClose }: NeofetchCardProps) {
	return (
		<div className="fixed inset-0 z-[9999] overflow-hidden bg-black text-white">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.16),transparent_35%)]" />

			<button
				type="button"
				onClick={onClose}
				className="absolute right-6 top-6 z-20 rounded-xl border border-cyan-500/30 bg-black px-4 py-2 font-mono text-sm text-cyan-300 hover:bg-cyan-500/10"
			>
				exit
			</button>

			<div className="relative z-10 flex h-full items-center justify-center px-8">
				<div className="grid max-w-5xl grid-cols-1 gap-8 rounded-2xl border border-cyan-500/20 bg-black/80 p-8 font-mono text-sm shadow-[0_0_60px_rgba(34,211,238,0.16)] lg:grid-cols-[auto_1fr]">
					<pre className="text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]">
{String.raw`
        :::      ::::::::
      :+:      :+:    :+:
    +:+ +:+         +:+
  +#+  +:+       +#+
+ +#+#+#+#+#+   +#+
     #+#    #+#
    ###   ########.ch
`}
					</pre>

					<div className="space-y-1 text-white/80">
						<p>
							<span className="text-pink-400">Segfault Society</span>@ft_transcendence
						</p>
						<p className="text-white/40">--------------------------------</p>
						<p><span className="text-cyan-400">School:</span> 42 Lausanne</p>
						<p><span className="text-cyan-400">Project:</span> ft_transcendence</p>
						<p><span className="text-cyan-400">Stack:</span> NestJS · React · Prisma · PostgreSQL</p>
						<p><span className="text-cyan-400">Sockets:</span> /game · /chat · /presence</p>
						<p><span className="text-cyan-400">Security:</span> JWT · 2FA · OAuth · HttpOnly cookies</p>
						<p><span className="text-cyan-400">Members:</span> @Nico-Ry @simo1616 @Mikan95 @ldsr18 @nasdhn</p>
						<p><span className="text-cyan-400">Uptime:</span> until someone runs make nuke</p>
						<p><span className="text-cyan-400">Mood:</span> one merge conflict away from enlightenment</p>
						<p><span className="text-cyan-400">Bug status:</span> works on my machine™</p>
						<p><span className="text-cyan-400">Final boss:</span> evaluation day Wi-Fi</p>

						<div className="mt-4 flex gap-1">
							<span className="h-4 w-8 rounded bg-black border border-white/20" />
							<span className="h-4 w-8 rounded bg-red-500" />
							<span className="h-4 w-8 rounded bg-green-500" />
							<span className="h-4 w-8 rounded bg-yellow-400" />
							<span className="h-4 w-8 rounded bg-blue-500" />
							<span className="h-4 w-8 rounded bg-pink-500" />
							<span className="h-4 w-8 rounded bg-cyan-400" />
							<span className="h-4 w-8 rounded bg-white" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
