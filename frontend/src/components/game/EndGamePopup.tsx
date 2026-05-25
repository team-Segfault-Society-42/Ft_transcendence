import type { PlayerLeft, PlayerRole, ReplayState } from '@/type/game.types';
import type { EndGameMessage } from './boardHelpers';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Username } from '@/components/ui/Username';
import { useEffect, useRef } from 'react';
import { endGamePopupClasses } from '@/styles/gameChatClasses';

type Props = {
	endGameMessage: EndGameMessage;
	playerRole: PlayerRole | null;
	playerLeft: PlayerLeft;
	replayVotes: ReplayState;
	waitingReplayOtherPlayer: boolean;
	requestReplay: () => void;
	leaveGame: () => void;
	navigate: (path: string) => void;
	playWinSound: () => void;
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
	playWinSound,
}: Props) {
	const { t } = useTranslation();
	const canReplay = (playerRole === 'X' || playerRole === 'O') && !playerLeft;
	const hasVoted =
		playerRole === 'X'
			? replayVotes.X
			: playerRole === 'O'
				? replayVotes.O
				: false;
	const didPlayWinSound = useRef(false);

	useEffect(() => {
		if (didPlayWinSound.current) return;
		if (!endGameMessage.winnerName) return;
		playWinSound();
		didPlayWinSound.current = true;
	}, [endGameMessage.winnerName, playWinSound]);

	return (
		<Card className={endGamePopupClasses.card}>
			<div
				className={`${endGamePopupClasses.title} ${endGameMessage.color}`}
			>
				{endGameMessage.winnerName ? (
					<>
						<Username
							name={endGameMessage.winnerName}
							variant="card"
							className={endGamePopupClasses.winnerName}
						/>
						<span>{endGameMessage.resultText}</span>
					</>
				) : (
					endGameMessage.resultText
				)}
			</div>

			<p className={endGamePopupClasses.subtitle}>
				{endGameMessage.subtitle}
			</p>

			{canReplay ? (
				<div className={endGamePopupClasses.replayActions}>
					<Button onClick={requestReplay} disabled={hasVoted}>
						{waitingReplayOtherPlayer
							? t('game.waiting', { defaultValue: 'Waiting...' })
							: t('game.replay', { defaultValue: 'REPLAY' })}
					</Button>

					<div className={endGamePopupClasses.replayVotes}>
						<span
							className={`${endGamePopupClasses.vote} ${
								replayVotes.X
									? endGamePopupClasses.voteXActive
									: endGamePopupClasses.voteInactive
							}`}
						>
							X {replayVotes.X ? '✓' : ''}
						</span>

						<span
							className={`${endGamePopupClasses.vote} ${
								replayVotes.O
									? endGamePopupClasses.voteOActive
									: endGamePopupClasses.voteInactive
							}`}
						>
							O {replayVotes.O ? '✓' : ''}
						</span>
					</div>
				</div>
			) : (
				<p className={endGamePopupClasses.disabledReplayText}>
					{playerLeft
						? t('game.end.opponentLeftReplay')
						: t('game.end.decidingReplay')}
				</p>
			)}

			<Button
				variant="secondary"
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
