import { Avatar } from '../ui/Avatar';
import { Username } from '../ui/Username';
import { Card } from '../ui/Card';

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
			className={`relative overflow-hidden flex flex-col items-center ${isActive ? 'ring-2 ring-cyan-400' : ''}`}
		>
			<span className="absolute text-[8rem] font-black text-white/10 select-none pointer-events-none leading-none">
				{symbol}
			</span>
			<Avatar src={avatar} alt={`player ${symbol}`} fallback={name[0]} />
			<Username name={name} variant="card" className="font-bold" />
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
	const percentage = (timeLeft / 30) * 100;
	return (
		<div className="grid grid-cols-3 gap-4 mb-8 text-white">
			<PlayerCard
				symbol="X"
				name={playerXName}
				avatar={playerXAvatar}
				isActive={currentPlayer === 'X'}
			/>

			<div className="flex items-center justify-center">
				<div
					className="grid size-24 place-items-center rounded-full text-xl font-bold"
					style={{
						background: `radial-gradient(#111827 65%, #0000 0), 
               conic-gradient(${percentage > 30 ? `#22d300` : '#ef4444'} ${percentage}%, #0000 0)`,
					}}
				>
					{timeLeft}s
				</div>
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
