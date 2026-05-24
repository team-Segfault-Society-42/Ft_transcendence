import i18n from "@/i18n/config";

/**
 * Maps backend game errors to messages that can be shown in the UI.
 *
 * @param rawMessage - Error message or code received from the game socket.
 * @returns A readable game error message.
 */
export function gameErrorMsg(rawMessage: string | null | undefined): string {
  if (!rawMessage) return i18n.t("errors.game.default");

  const raw = rawMessage.trim();
  if (!raw) return i18n.t("errors.game.default");

  const message = raw.toLowerCase();

  if (raw.startsWith("ERR_GAME_") && i18n.exists(raw)) {
    return i18n.t(raw);
  }

  if (message.includes("user not found")) {
    return i18n.t("errors.game.userNotFound");
  }

  if (message.includes("game with id") && message.includes("not found")) {
    return i18n.t("errors.game.gameNotFound");
  }

  if (message.includes("not your turn")) {
    return i18n.t("errors.game.notYourTurn");
  }

  if (message.includes("waiting for both players")) {
    return i18n.t("errors.game.waitingOpponent");
  }

  if (message.includes("already occupied")) {
    return i18n.t("errors.game.alreadyOccupied");
  }

  if (message.includes("replay is only available after game end")) {
    return i18n.t("errors.game.replayUnavailable");
  }

  if (message.includes("spectators cannot play")) {
    return i18n.t("errors.game.spectatorCannotPlay");
  }

  if (message.includes("spectators cannot request replay")) {
    return i18n.t("errors.game.spectatorCannotReplay");
  }

  if (message.includes("move out of range")) {
    return i18n.t("errors.game.invalidMove");
  }

  if (message.includes("unknown error")) {
    return i18n.t("errors.game.unknown");
  }

  return raw;
}
