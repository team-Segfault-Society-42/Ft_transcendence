import { Avatar } from '../ui/Avatar';
import { Username } from '../ui/Username';
import { Card } from '../ui/Card';
import { Circle, X } from 'lucide-react';
import type { PlayerRole, PlayerSymbol } from '@/type/game.types';

type PlayerCardProps = {
	symbol: PlayerSymbol;
	name: string;
	avatar: string | undefined;
	isActive: boolean;
	isYou: boolean;
};

type Props = {
	playerXName: string;
	playerOName: string;
	playerXAvatar: string | undefined;
	playerOAvatar: string | undefined;
	currentPlayer: PlayerSymbol;
	timeLeft: number;
	playerRole: PlayerRole | null;
};

function PlayerSymbolIcon({ symbol }: { symbol: PlayerSymbol }) {
	const Icon = symbol === 'X' ? X : Circle;
	const color = symbol === 'X' ? 'text-cyan-400' : 'text-fuchsia-400';

	return (
		<span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5">
			<Icon className={`h-4 w-4 stroke-3 ${color}`} />
		</span>
	);
}

function PlayerCard({
	symbol,
	name,
	avatar,
	isActive,
	isYou,
}: PlayerCardProps) {
	return (
		<div className="relative mt-4">
			{isYou && (
				<span className="absolute inset-x-0 -top-6 text-center text-xs font-bold uppercase text-cyan-400">
					You
				</span>
			)}
			<Card
				className={`flex w-28 flex-col items-center p-3
	        ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
			>
				<Avatar src={avatar} alt={`player ${symbol}`} fallback={name[0]} />
				<div className="mt-3 flex w-full min-w-0 items-center justify-center gap-1 font-bold">
					<PlayerSymbolIcon symbol={symbol} />
					<Username
						name={name}
						variant="card"
						className="text-xs max-w-14 font-bold"
					/>
				</div>
			</Card>
		</div>
	);
}

export function PlayerCards({
	playerXName,
	playerOName,
	playerXAvatar,
	playerOAvatar,
	currentPlayer,
	timeLeft,
	playerRole,
}: Props) {
	const percentage = Math.max(0, Math.min(100, (timeLeft / 30) * 100));

	return (
		<div className="mb-8 flex w-full max-w-96 items-center justify-between text-white">
			<PlayerCard
				symbol="X"
				name={playerXName}
				avatar={playerXAvatar}
				isActive={currentPlayer === 'X'}
				isYou={playerRole === 'X'}
			/>

			<div
				className="grid size-16 place-items-center rounded-full text-sm font-bold"
				style={{
					background: `radial-gradient(#111827 65%, #0000 0), 
               conic-gradient(${percentage > 30 ? `#22d300` : '#ef4444'} ${percentage}%, #0000 0)`,
				}}
			>
				{timeLeft}s
			</div>

			<PlayerCard
				symbol="O"
				name={playerOName}
				avatar={playerOAvatar}
				isActive={currentPlayer === 'O'}
				isYou={playerRole === 'O'}
			/>
		</div>
	);
}
