export function gameErrorMsg(rawMessage: string | null | undefined): string {
  if (!rawMessage) return "Something went wrong";

  const message = rawMessage.toLowerCase();

  if (message.includes("user not found")) {
    return "User not found";
  }

  if (message.includes("game with id") && message.includes("not found")) {
    return "Game not found";
  }

  if (message.includes("not your turn")) {
    return "It is not your turn";
  }

  if (message.includes("waiting for both players")) {
    return "Waiting for opponent...";
  }

  if (message.includes("already occupied")) {
    return "This cell is already occupied";
  }

  if (message.includes("replay is only available after game end")) {
    return "Replay is only available after the game ends";
  }

  if (message.includes("spectators cannot play")) {
    return "Spectators cannot play";
  }

  if (message.includes("spectators cannot request replay")) {
    return "Spectators cannot request replay";
  }

  if (message.includes("move out of range")) {
    return "Invalid move";
  }

  if (message.includes("unknown error")) {
    return "Unknown error";
  }

  return rawMessage;
}
