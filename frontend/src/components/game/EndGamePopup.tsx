import type { PlayerLeft, PlayerRole, ReplayState } from '@/type/game.types';
import type { EndGameMessage } from './boardHelpers';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Props = {
	endGameMessage: EndGameMessage;
	playerRole: PlayerRole | null;
	playerLeft: PlayerLeft;
	replayVotes: ReplayState;
	waitingReplayOtherPlayer: boolean;
	requestReplay: () => void;
	leaveGame: () => void;
	navigate: (path: string) => void;
};

export function EndGamePopup({
	endGameMessage,
	playerRole,
	playerLeft,
	replayVotes,
	waitingReplayOtherPlayer,
	requestReplay,
	leaveGame,
	navigate,
}: Props) {
	const { t } = useTranslation();
	return (
		<Card className="flex min-w-80 max-w-[90vw] flex-col items-center gap-4 bg-slate-900 p-8 text-white hover:scale-100">
			<h2
				className={`text-center text-2xl font-bold wrap-break-word ${endGameMessage.color}`}
			>
				{endGameMessage.title}
			</h2>

			<p className="text-center text-sm font-medium text-white/70">
				{endGameMessage.subtitle}
			</p>

			<p className="text-center text-sm text-white/50">
				{playerLeft
					? 'Opponent left - replay unavailable'
					: playerRole === 'X' || playerRole === 'O'
						? 'You can request a replay'
						: 'Players try to decide whether to replay'}
			</p>

			{(playerRole === 'X' || playerRole === 'O') && !playerLeft && (
				<>
					<Button onClick={requestReplay}>
						{t('game.replay', { defaultValue: 'REPLAY' })}
					</Button>

					<p className="text-sm text-white/60">
						{t('game.replayVotes', { defaultValue: 'Replay votes' })} - X:{' '}
						{replayVotes.X ? '✓' : '...'} | O: {replayVotes.O ? '✓' : '...'}
					</p>

					{waitingReplayOtherPlayer && (
						<div className="text-center text-sm font-medium text-fuchsia-400">
							{t('game.waitingReplayOther', {
								defaultValue:
									'Replay requested. Waiting for the other player...',
							})}
						</div>
					)}
				</>
			)}

			<Button
				onClick={() => {
					leaveGame();
					navigate('/');
				}}
			>
				{t('game.backHome', { defaultValue: 'Back to home' })}
			</Button>
		</Card>
	);
}
