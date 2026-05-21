import type { CellValue, EndReason } from '@/type/game.types';
import i18n from '@/i18n/config';

export type EndGameMessage = {
	winnerName: string | null;
	resultText: string;
	subtitle: string;
	color: string;
};

export function getEndGameMessage(
	endReason: EndReason,
	winner: CellValue,
	playerXName: string,
	playerOName: string,
): EndGameMessage {
	const winnerName =
		winner === 'X' ? playerXName : winner === 'O' ? playerOName : 'Player';

	const loserName =
		winner === 'X' ? playerOName : winner === 'O' ? playerXName : 'Opponent';

	if (endReason === 'draw') {
		return {
			winnerName: null,
			resultText: i18n.t('game.end.draw.title'),
			subtitle: i18n.t('game.end.draw.subtitle'),
			color: 'text-slate-500',
		};
	}

	if (endReason === 'timeout') {
		return {
			winnerName,
			resultText: i18n.t('game.end.timeout.title'),
			subtitle: i18n.t('game.end.timeout.subtitle', { name: loserName }),
			color: 'text-orange-500',
		};
	}

	if (endReason === 'forfeit') {
		return {
			winnerName,
			resultText: i18n.t('game.end.forfeit.title'),
			subtitle: i18n.t('game.end.forfeit.subtitle', { name: loserName }),
			color: 'text-red-500',
		};
	}

	if (endReason === 'win') {
		return {
			winnerName,
			resultText: i18n.t('game.end.normalWin.title'),
			subtitle: i18n.t('game.end.normalWin.subtitle'),
			color: winner === 'X' ? 'text-cyan-500' : 'text-fuchsia-500',
		};
	}

	return {
		winnerName: null,
		resultText: i18n.t('game.end.default.title'),
		subtitle: i18n.t('game.end.default.subtitle'),
		color: 'text-gray-600',
	};
}
