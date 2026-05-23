import type { GameStatus, PlayerRole } from '@/type/game.types';
import { useTranslation } from 'react-i18next';

type Props = {
	error: string | null;
	status: GameStatus | null;
	playerRole: PlayerRole | null;
	canPlay: boolean;
	hasReplayRole: boolean;
	opponentDisconnect: boolean;
};

export function GameStatusBanner({
	error,
	status,
	playerRole,
	opponentDisconnect,
}: Props) {
	const { t } = useTranslation();
	return (
		<div>
			{error && (
				<div className="mb-4 rounded-lg border border-red-400 bg-red-500/20 px-4 py-3 text-red-200">
					{error}
				</div>
			)}

			{playerRole === 'spectator' && (
				<div className="mb-4 text-sm text-white/70">
					{t('game.spectating', { defaultValue: 'You are spectating' })}
				</div>
			)}

			{status === 'playing' && opponentDisconnect && (
				<div className="border border-orange-400 bg-orange-500/20 px-4 py-3 text-orange-100">
					{t('game.opponentDisconnect')}
				</div>
			)}
		</div>
	);
}
