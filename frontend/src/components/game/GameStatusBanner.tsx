import type { GameStatus, PlayerRole } from '@/type/game.types';
import { useTranslation } from 'react-i18next';
import { gameStatusBannerClasses } from '@/styles/gameChatClasses';

type Props = {
	error: string | null;
	status: GameStatus | null;
	playerRole: PlayerRole | null;
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
				<div className={gameStatusBannerClasses.error}>
					{error}
				</div>
			)}

			{playerRole === 'spectator' && (
				<div className="mb-4 text-sm text-white/70">
					{t('game.spectating', { defaultValue: 'You are spectating' })}
				</div>
			)}

			{status === 'playing' && opponentDisconnect && (
				<div className={gameStatusBannerClasses.disconnect}>
					{t('game.opponentDisconnect')}
				</div>
			)}
		</div>
	);
}
