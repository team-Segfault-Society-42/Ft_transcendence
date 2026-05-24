import { Avatar } from '../ui/Avatar';
import { Username } from '../ui/Username';
import { Card } from '../ui/Card';
import { Circle, X } from 'lucide-react';
import type { PlayerRole, PlayerSymbol } from '@/type/game.types';
import { useTranslation } from 'react-i18next';

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
		<span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 sm:h-6 sm:w-6">
			<Icon className={`h-3.5 w-3.5 stroke-3 sm:h-4 sm:w-4 ${color}`} />
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
	const { t } = useTranslation();

	return (
		<div className="relative mt-2 sm:mt-4">
			{isYou && (
				<span className="absolute inset-x-0 -top-4 text-center text-[10px] font-bold uppercase text-cyan-400 sm:-top-6 sm:text-xs">
					{t('game.you')}
				</span>
			)}
			<Card
				className={`flex w-24 flex-col items-center p-2 sm:w-28 sm:p-3
				${isActive ? 'ring-2 ring-cyan-400' : ''}`}
			>
				<Avatar src={avatar} alt={`player ${symbol}`} fallback={name[0]} />
				<div className="mt-2 flex w-full min-w-0 items-center justify-center gap-1 font-bold sm:mt-3">
					<PlayerSymbolIcon symbol={symbol} />
					<Username
						name={name}
						variant="card"
						className="max-w-10 text-[11px] font-bold sm:max-w-14 sm:text-xs"
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
		<div className="mb-3 flex w-full max-w-[280px] items-center justify-between text-white sm:mb-8 sm:max-w-96">
			<PlayerCard
				symbol="X"
				name={playerXName}
				avatar={playerXAvatar}
				isActive={currentPlayer === 'X'}
				isYou={playerRole === 'X'}
			/>

			<div
				className="grid size-11 place-items-center rounded-full text-xs font-bold sm:size-16 sm:text-sm"
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
