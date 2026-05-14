import { Avatar } from '../ui/Avatar';
import { Username } from '../ui/Username';
import { Card } from '../ui/Card';
import { Circle, X } from 'lucide-react';

type PlayerCardProps = {
	symbol: 'X' | 'O';
	name: string;
	avatar: string | undefined;
	isActive: boolean;
};

type Props = {
	playerXName: string;
	playerOName: string;
	playerXAvatar: string | undefined;
	playerOAvatar: string | undefined;
	currentPlayer: string;
	timeLeft: number;
};

function PlayerCard({ symbol, name, avatar, isActive }: PlayerCardProps) {
	return (
		<Card
			className={`relative flex w-24 shrink-0 flex-col items-center gap-1 overflow-hidden p-3 sm:w-28 sm:p-4 
        ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
		>
			<Avatar src={avatar} alt={`player ${symbol}`} fallback={name[0]} />
			<div className="flex items-center gap-1 font-bold">
				{symbol === 'X' ? (
					<X className="w-5 h-5 text-red-500 stroke-3" />
				) : (
					<Circle className="w-5 h-5 text-yellow-400 stroke-3" />
				)}
				<Username name={name} variant="card" className="font-bold" />
			</div>
		</Card>
	);
}

export function PlayerCards({
	playerXName,
	playerOName,
	playerXAvatar,
	playerOAvatar,
	currentPlayer,
	timeLeft,
}: Props) {
	const percentage = Math.max(0, Math.min(100, (timeLeft / 30) * 100));

	return (
		<div className="mb-8 flex w-96 max-w-full items-center justify-between text-white">
			<PlayerCard
				symbol="X"
				name={playerXName}
				avatar={playerXAvatar}
				isActive={currentPlayer === 'X'}
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
			/>
		</div>
	);
}
