import type { PlayerLeft, PlayerRole, ReplayState } from '@/type/game.types';
import type { EndGameMessage } from './boardHelpers';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Username } from '@/components/ui/Username';
import { useEffect, useRef } from 'react';

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
		<Card className="flex min-w-80 max-w-[90vw] flex-col items-center gap-4 bg-slate-900 p-8 text-white hover:scale-100">
			<h2
				className={`flex max-w-full items-center justify-center gap-2 text-center text-2xl font-bold ${endGameMessage.color}`}
			>
				{endGameMessage.winnerName ? (
					<>
						<Username
							name={endGameMessage.winnerName}
							variant="card"
							className="max-w-32 font-bold"
						/>
						<span>{endGameMessage.resultText}</span>
					</>
				) : (
					endGameMessage.resultText
				)}
			</h2>

			<p className="text-center text-sm font-medium text-white/70">
				{endGameMessage.subtitle}
			</p>

			{canReplay ? (
				<div className="flex flex-col items-center gap-3">
					<Button onClick={requestReplay} disabled={hasVoted}>
						{waitingReplayOtherPlayer
							? t('game.waiting', { defaultValue: 'Waiting...' })
							: t('game.replay', { defaultValue: 'REPLAY' })}
					</Button>

					<div className="flex gap-2 text-xs font-bold">
						<span
							className={`rounded-full border px-3 py-1 ${
								replayVotes.X
									? 'border-cyan-400 text-cyan-400'
									: 'border-white/10 text-white/40'
							}`}
						>
							X {replayVotes.X ? '✓' : ''}
						</span>

						<span
							className={`rounded-full border px-3 py-1 ${
								replayVotes.O
									? 'border-fuchsia-400 text-fuchsia-400'
									: 'border-white/10 text-white/40'
							}`}
						>
							O {replayVotes.O ? '✓' : ''}
						</span>
					</div>
				</div>
			) : (
				<p className="text-center text-sm text-white/50">
					{playerLeft
						? 'Opponent left - replay unavailable'
						: 'Players try to decide whether to replay'}
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
