import { useEffect } from 'react';
import Board from '../components/game/Board';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../Store/gameStore';
import { isGameNotFoundError } from '@/lib/gameErrorMsg';
import type { GameState, PlayerRole } from '@/type/game.types';
import i18n from '@/i18n/config';
import { gamePageClasses } from '@/styles/gameChatClasses';

type JoinedAsPayload = {
	role: PlayerRole;
};

type GameErrorPayload = {
	code: string;
};

export default function Game() {
	const { gameId } = useParams<{ gameId: string }>();

	useEffect(() => {
		if (!gameId) return;
		useGameStore.getState().resetGameState();

		const client = io(`${window.location.origin}/game`, {
			path: '/socket.io/',
			transports: ['websocket'],
			withCredentials: true,
		});

		client.on('connect', () => {
			useGameStore.getState().setGameId(gameId);
			useGameStore.getState().setClient(client);
			client.emit('join_game', { gameId });
		});

		client.on('joined_as', (payload: JoinedAsPayload) => {
			useGameStore.getState().setPlayerRole(payload.role);
		});

		client.on('connect_error', () =>
			useGameStore.getState().setError(i18n.t('errors.game.default')),
		);

		client.on('game_updated', (payload: GameState) => {
			useGameStore.getState().syncFromServer(payload);
		});

		client.on('role_updated', (payload: JoinedAsPayload) => {
			useGameStore.getState().setPlayerRole(payload.role);
		});

		client.on('game_error', (payload: GameErrorPayload) => {
			const store = useGameStore.getState();

			if (isGameNotFoundError(payload.code)) {
				store.resetGameState();
				store.setError('ERR_GAME_NOT_FOUND');
				return;
			}

			store.setError(payload.code);
		});

		return () => {
			client.disconnect();
			useGameStore.getState().resetGameState();
		};
	}, [gameId]);

	return (
		<div className={gamePageClasses.container}>
			<Board />
		</div>
	);
}
