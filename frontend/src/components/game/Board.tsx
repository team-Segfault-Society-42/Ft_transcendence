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
import { Input } from '../ui/Input';

export default function Board() {
	const {
		gameId,
		game,
		error,
		playMove,
		playerRole,
		requestReplay,
		leaveGame,
	} = useGameStore();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const timeLeft = useGameTimer(game);

	const oldOppDiscnct = useRef(false);

	const xDisconnect =
		game?.players.X.socketId === null && game.players.X.ownerUserId !== null;
	const oDisconnect =
		game?.players.O.socketId === null && game.players.O.ownerUserId !== null;
	const opponentDisconnect =
		playerRole === 'X' ? oDisconnect : playerRole === 'O' ? xDisconnect : false;

	useEffect(() => {
		if (game?.playerLeft) {
			toast.warning('Opponent left - no replay!');
		}
	}, [game?.playerLeft]);

	useEffect(() => {
		if (oldOppDiscnct.current && !opponentDisconnect) {
			toast.success('Opponent reconnected!');
		}
		oldOppDiscnct.current = opponentDisconnect;
	}, [opponentDisconnect]);

	if (error && !game) {
		return (
			<div className="text-white text-center p-8">
				<div className="mb-4">{error}</div>
				<Button onClick={() => navigate('/')}>Back to home</Button>
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
		<div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl sm:p-8">
			<div className="grid w-full grid-cols-1 items-start justify-items-center gap-6 text-center lg:grid-cols-[1fr_auto_1fr]">
				{/* play area*/}
				<div className="flex flex-col items-center lg:col-start-2">
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
						canPlay={canPlay}
						hasReplayRole={hasReplayRole}
						opponentDisconnect={opponentDisconnect}
					/>

					<div className="grid w-96 max-w-full grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/20 p-8">
						{flatBoard.map((value, i) => (
							<Square
								key={i}
								value={value}
								isWarning={i === toDisapear}
								onSquareClick={() => {
									if (!canPlay) return;
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
				<div className="w-80 lg:col-start-3 lg:justify-self-start">
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
						/>
					)}
				</div>
			</div>
		</div>
	);
}
