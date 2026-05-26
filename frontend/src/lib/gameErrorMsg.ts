import i18n from '@/i18n/config';

/**
 * Maps backend game errors to messages that can be shown in the UI.
 *
 * @param rawMessage - Error message or code received from the game socket.
 * @returns A readable game error message.
 */
export function gameErrorMsg(rawMessage: string | null | undefined): string {
	if (!rawMessage) return i18n.t('errors.game.default');

	const raw = rawMessage.trim();
	if (!raw) return i18n.t('errors.game.default');

	if (isGameNotFoundError(raw)) {
		return i18n.t('game.errors.noLongerAvailable');
	}

	if (raw.startsWith('ERR_') && i18n.exists(`backend.${raw}`)) {
		return i18n.t(`backend.${raw}`);
	}

	return i18n.t('errors.game.default');
}

export function isGameNotFoundError(
	rawMessage: string | null | undefined,
): boolean {
	return rawMessage?.trim() === 'ERR_GAME_NOT_FOUND';
}
