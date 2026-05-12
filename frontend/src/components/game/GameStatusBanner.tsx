import type { GameStatus, PlayerRole } from "@/type/game.types";
import { useTranslation } from "react-i18next";

type Props = {
  error: string | null;
  status: GameStatus | null;
  playerRole: PlayerRole | null;
  canPlay: boolean;
  hasReplayRole: boolean;
  opponentDisconnect: boolean;
};

// error, status, playerRole, canPlay, hasReplayRole,
export function GameStatusBanner({
  error,
  status,
  playerRole,
  canPlay,
  hasReplayRole,
  opponentDisconnect,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-500/20 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-white/70">
        {playerRole === "spectator" &&
          t("game.spectating", { defaultValue: "You are spectating" })}
      </div>

      {status === "waiting" && (
        <div className="mb-4 rounded-lg border border-yellow-400 bg-yellow-500/20 px-4 py-3 text-yellow-100">
          {t("game.waitingOpponent", {
            defaultValue: "Waiting for opponent...",
          })}
        </div>
      )}

      {status === "playing" && hasReplayRole && !canPlay && (
        <div className="mb-4 rounded-lg border border-blue-400 bg-blue-500/20 px-4 py-3 text-blue-100">
          {t("game.waitingMove", {
            defaultValue: "Waiting for opponent move...",
          })}
        </div>
      )}

      {status === "playing" && opponentDisconnect && (
        <div className="border border-orange-400 bg-orange-500/20 px-4 py-3 text-orange-100">
          Opponent disconnected — waiting 20s for reconnection...
        </div>
      )}
    </>
  );
}
