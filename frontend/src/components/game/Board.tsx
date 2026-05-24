import useSound from 'use-sound';
import Square from './Square';
import { useGameStore } from '../../Store/gameStore';
import type { CellValue } from '../../type/game.types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getEndGameMessage } from './boardHelpers';
import { Gamepad2 } from 'lucide-react';
import { EmptyStateCard } from '@/components/ui/EmptyCard';
import { useGameTimer } from '../hooks/useGameTimer';
import { PlayerCards } from './PlayerCards';
import { GameStatusBanner } from './GameStatusBanner';
import { EndGamePopup } from './EndGamePopup';
import { SpectatorCount } from './SpectatorCount';
import { Button } from '@/components/ui/Button';

export default function Board() {
	const { game, error, playMove, playerRole, requestReplay, leaveGame } =
		useGameStore();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const timeLeft = useGameTimer(game);

	const oldOppDiscnct = useRef(false);
	const [playErrorSound] = useSound('/sounds/cell_error.mp3', { volume: 0.1 });
	const [playSound] = useSound('/sounds/place.mp3', { volume: 0.2 });
	const [playWinSound] = useSound('/sounds/win.mp3', { volume: 0.01 });

	const xDisconnect =
		game?.players.X.socketIds.length === 0 &&
		game.players.X.ownerUserId !== null;
	const oDisconnect =
		game?.players.O.socketIds.length === 0 &&
		game.players.O.ownerUserId !== null;
	const opponentDisconnect =
		playerRole === 'X' ? oDisconnect : playerRole === 'O' ? xDisconnect : false;

	useEffect(() => {
		if (game?.playerLeft) {
			toast.warning(t('game.status.opponentLeft'));
		}
	}, [game?.playerLeft, t]);

	useEffect(() => {
		if (oldOppDiscnct.current && !opponentDisconnect) {
			toast.success(t('game.status.opponentReconnected'));
		}
		oldOppDiscnct.current = opponentDisconnect;
	}, [opponentDisconnect, t]);

	if (error && !game) {
		return (
			<div className="text-white text-center p-8">
				<div className="mb-4">{error}</div>
				<Button onClick={() => navigate('/')}>{t('buttons.backHome')}</Button>
			</div>
		);
	}

	if (!game) {
		return (
			<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
				<EmptyStateCard
					title={t('game.title')}
					icon={<Gamepad2 size={24} />}
					message={t('game.notConnected')}
					description={t('game.login')}
				/>
			</section>
		);
	}

	if (game.status === 'waiting' && playerRole === 'X') {
		navigate('/play');
	}
	const { board, currentPlayer, status, winner, toDisapear } = game;

	const playerXName = game.playerProfiles?.X?.username || 'Player X';
	const playerOName = game.playerProfiles?.O?.username || 'Player O';
	const playerXAvatar = game.playerProfiles?.X?.avatar ?? undefined;
	const playerOAvatar = game.playerProfiles?.O?.avatar ?? undefined;

	const flatBoard: CellValue[] = board.flat();
	const showPopup = status === 'finished' && game.endReason !== null;

	const canPlay =
		status === 'playing' &&
		(playerRole === 'X' || playerRole === 'O') &&
		playerRole === currentPlayer;

	const hasReplayRole = playerRole === 'X' || playerRole === 'O';

	const waitingReplayOtherPlayer =
		status === 'finished' &&
		hasReplayRole &&
		((playerRole === 'X' && game.replayVotes.X && !game.replayVotes.O) ||
			(playerRole === 'O' && game.replayVotes.O && !game.replayVotes.X));

	const endGameMessage = getEndGameMessage(
		game.endReason,
		winner,
		playerXName,
		playerOName,
	);

	return (
		<div className="w-full max-w-5xl overflow-x-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl sm:p-6 xl:p-8">
			<div className="grid w-full min-w-0 grid-cols-1 items-start justify-items-center gap-6 text-center xl:grid-cols-[1fr_auto_1fr]">
				{/* play area*/}
				<div className="flex w-full min-w-0 max-w-96 flex-col items-center xl:col-start-2">
					<PlayerCards
						playerXName={playerXName}
						playerOName={playerOName}
						playerXAvatar={playerXAvatar}
						playerOAvatar={playerOAvatar}
						currentPlayer={currentPlayer}
						timeLeft={timeLeft}
						playerRole={playerRole}
					/>

					<GameStatusBanner
						error={error}
						status={status}
						playerRole={playerRole}
						opponentDisconnect={opponentDisconnect}
					/>

					<div className="grid w-full max-w-96 grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-8">
						{flatBoard.map((value, i) => (
							<Square
								key={i}
								value={value}
								isWarning={i === toDisapear}
								onSquareClick={() => {
									if (!canPlay || value !== null) {
										playErrorSound();
										return;
									}
									playSound();
									playMove(i);
								}}
							/>
						))}
					</div>

					<div className="mt-6 text-white/60 font-medium">
						<SpectatorCount count={game.spectatCnt} />
					</div>
				</div>

				{/* Popup Replay */}
				<div className="w-full min-w-0 max-w-80 xl:col-start-3 xl:justify-self-start">
					{showPopup && (
						<EndGamePopup
							endGameMessage={endGameMessage}
							playerRole={playerRole}
							playerLeft={game.playerLeft}
							replayVotes={game.replayVotes}
							waitingReplayOtherPlayer={waitingReplayOtherPlayer}
							requestReplay={requestReplay}
							leaveGame={leaveGame}
							navigate={navigate}
							playWinSound={playWinSound}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
