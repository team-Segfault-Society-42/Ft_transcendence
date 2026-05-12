import type { PlayerLeft, PlayerRole, ReplayState } from "@/type/game.types";
import type { EndGameMessage } from "./boardHelpers";
import { useTranslation } from "react-i18next";

type Props = {
  endGameMessage: EndGameMessage;
  playerRole: PlayerRole | null;
  playerLeft: PlayerLeft;
  replayVotes: ReplayState;
  waitingReplayOtherPlayer: boolean;
  requestReplay: () => void;
  leaveGame: () => void;
  navigate: (path: string) => void;
};
// endGameMessage, playerRole, playerLeft, replayVotes,
// waitingReplayOtherPlayer, requestReplay, leaveGame, navigate

export function EndGamePopup({
  endGameMessage,
  playerRole,
  playerLeft,
  replayVotes,
  waitingReplayOtherPlayer,
  requestReplay,
  leaveGame,
  navigate,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-40">
      <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center gap-4 min-w-[320px] max-w-[90vw]">
        <h2
          className={`text-2xl font-bold text-center wrap-break-word ${endGameMessage.color}`}
        >
          {endGameMessage.title}
        </h2>

        <p className="text-sm text-gray-600 font-medium text-center">
          {endGameMessage.subtitle}
        </p>

        <p className="text-sm text-gray-500 text-center">
          {playerLeft
            ? "Opponent left - replay unavailable"
            : playerRole === "X" || playerRole === "O"
              ? "You can request a replay"
              : "Players try to decide whether to replay"}
        </p>

        {(playerRole === "X" || playerRole === "O") && !playerLeft && (
          <>
            <button
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              onClick={requestReplay}
            >
              {t("game.replay", { defaultValue: "REPLAY" })}
            </button>

            <p className="text-sm text-gray-600">
              {t("game.replayVotes", {
                defaultValue: "Replay votes",
              })}{" "}
              — X: {replayVotes.X ? "✓" : "…"} | O: {replayVotes.O ? "✓" : "…"}
            </p>

            {waitingReplayOtherPlayer && (
              <div className="text-sm text-fuchsia-500 font-medium text-center">
                {t("game.waitingReplayOther", {
                  defaultValue:
                    "Replay requested. Waiting for the other player...",
                })}
              </div>
            )}
          </>
        )}

        <button
          className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          onClick={() => {
            leaveGame();
            navigate("/");
          }}
        >
          {t("game.backHome", { defaultValue: "Back to home" })}
        </button>
      </div>
    </div>
  );
}
