type NeofetchCardProps = {
	onClose: () => void;
};

const neofetchRows = [
	["School:", "42 Lausanne"],
	["Project:", "ft_transcendence"],
	["Stack:", "NestJS · React · Prisma · PostgreSQL"],
	["Sockets:", "/game · /chat · /presence"],
	["Security:", "JWT · 2FA · OAuth · HttpOnly cookies"],
	["Members:", "@Nico-Ry @simo1616 @Mikan95 @ldsr18 @nasdhn"],
	["Uptime:", "until someone runs make nuke"],
	["Mood:", "one merge conflict away from enlightenment"],
	["Bug status:", "works on my machine™"],
	["Final boss:", "evaluation day Wi-Fi"],
];

const colorBlocks = [
	"bg-black border border-white/20",
	"bg-red-500",
	"bg-green-500",
	"bg-yellow-400",
	"bg-blue-500",
	"bg-pink-500",
	"bg-cyan-400",
	"bg-white",
];

/**
 * Displays a fullscreen neofetch-style project card.
 *
 * @param onClose - Callback used to close the overlay.
 * @returns Fullscreen neofetch easter egg.
 */
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
							<span className="text-pink-400">
								Segfault Society
							</span>
							@ft_transcendence
						</p>

						<p className="text-white/40">--------------------------------</p>

						{neofetchRows.map(([label, value]) => (
							<p key={label}>
								<span className="text-cyan-400">{label}</span>{" "}
								{value}
							</p>
						))}

						<div className="mt-4 flex gap-1">
							{colorBlocks.map((className) => (
								<span
									key={className}
									className={`h-4 w-8 rounded ${className}`}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
