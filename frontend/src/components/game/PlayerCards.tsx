import { Avatar } from '../ui/Avatar';
import { Username } from '../ui/Username';
import { Card } from '../ui/Card';
import { Circle, X } from 'lucide-react';
import type { PlayerRole, PlayerSymbol } from '@/type/game.types';
import { useTranslation } from 'react-i18next';
import { playerCardsClasses } from '@/styles/gameChatClasses';

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
		<span className={playerCardsClasses.symbolBadge}>
			<Icon className={`${playerCardsClasses.symbolIcon} ${color}`} />
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
				<span className={playerCardsClasses.youLabel}>
					{t('game.you')}
				</span>
			)}
			<Card
				className={`${playerCardsClasses.card} ${
					isActive ? playerCardsClasses.activeCard : ''
				}`}
			>
				<Avatar src={avatar} alt={`player ${symbol}`} fallback={name[0]} />
				<div className={playerCardsClasses.nameRow}>
					<PlayerSymbolIcon symbol={symbol} />
					<Username
						name={name}
						variant="card"
						className={playerCardsClasses.name}
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
		<div className={playerCardsClasses.container}>
			<PlayerCard
				symbol="X"
				name={playerXName}
				avatar={playerXAvatar}
				isActive={currentPlayer === 'X'}
				isYou={playerRole === 'X'}
			/>

			<div
				className={playerCardsClasses.timer}
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
