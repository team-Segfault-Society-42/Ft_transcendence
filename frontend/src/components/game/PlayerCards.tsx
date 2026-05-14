import { Avatar } from '../ui/Avatar';
import { Username } from '../ui/Username';
import { Card } from '../ui/Card';
import { Circle, X } from 'lucide-react';
import type { PlayerRole } from '@/type/game.types';

type PlayerCardProps = {
	symbol: 'X' | 'O';
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
	currentPlayer: string;
	timeLeft: number;
	playerRole: PlayerRole | null;
};

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
				<span className="text-3xl font-black bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
					You
				</span>
			)}
			<Card
				className={`flex w-28 flex-col items-center
        ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
			>
				<Avatar src={avatar} alt={`player ${symbol}`} fallback={name[0]} />
				<div className="flex items-center gap-2 font-bold  mt-3">
					{symbol === 'X' ? (
						<X className="w-5 h-5 text-cyan-400 stroke-3" />
					) : (
						<Circle className="w-5 h-5 text-fuchsia-400 stroke-3" />
					)}
					<Username name={name} variant="card" className="font-bold" />
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
		<div className="mb-8 flex w-96 max-w-full items-center justify-between text-white">
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
