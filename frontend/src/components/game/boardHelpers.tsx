import type { CellValue, EndReason } from "@/type/game.types";

export type EndGameMessage = {
  title: string;
  subtitle: string;
  color: string;
};

export function truncateUserName(username: string, maxLength = 12): string {
  if (!username) return "";
  if (username.length <= maxLength) return username;
  return username.slice(0, maxLength) + "…";
}

export function getEndGameMessage(
  endReason: EndReason,
  winner: CellValue,
  playerXName: string,
  playerOName: string,
): EndGameMessage {
  const winnerName =
    winner === "X" ? playerXName : winner === "O" ? playerOName : "Player";

  const loserName =
    winner === "X" ? playerOName : winner === "O" ? playerXName : "Opponent";

  if (endReason === "draw") {
    return {
      title: "Draw game",
      subtitle: "No player won this round",
      color: "text-slate-500",
    };
  }

  if (endReason === "timeout") {
    return {
      title: `🎉 ${winnerName} wins!`,
      subtitle: `${loserName} ran out of time`,
      color: "text-orange-500",
    };
  }

  if (endReason === "forfeit") {
    return {
      title: `🎉 ${winnerName} wins!`,
      subtitle: `${loserName} left the match`,
      color: "text-red-500",
    };
  }

  if (endReason === "win") {
    return {
      title: `🎉 ${winnerName} wins!`,
      subtitle: "Game finished normally",
      color: winner === "X" ? "text-cyan-500" : "text-fuchsia-500",
    };
  }

  return {
    title: "Game finished",
    subtitle: "This match has ended",
    color: "text-gray-600",
  };
}
