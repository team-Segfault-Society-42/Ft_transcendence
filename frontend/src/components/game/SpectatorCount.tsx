import { Eye } from 'lucide-react';

type Props = {
	count: number;
};

export function SpectatorCount({ count }: Props) {
	if (count <= 0) return null;

	return (
		<div className="mb-2 flex items-center justify-center gap-1 text-xs text-white/60">
			<Eye size={14} />

			<span>
				{/* a traduire */}
				{'Spectating this game: '}
				{count}
			</span>
		</div>
	);
}
