import Square from "./Square";
import { useGameStore } from "../Store/gameStore";
import type { CellValue } from "../type/game.types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";

function truncateUserName(username: string, maxLength = 12): string {
  if (!username) return "";
  if (username.length <= maxLength) return username;
  return username.slice(0, maxLength) + "…";
}

function getEndGameMessage(
  endReason: string | null,
  winner: "X" | "O" | null,
  playerXName: string,
  playerOName: string,
) {
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

const TURN_TIMEOUT_SECONDS = 30;

export default function Board() {
  const {
    gameId,
    client,
    game,
    error,
    playMove,
    playerRole,
    requestReplay,
    leaveGame,
  } = useGameStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(TURN_TIMEOUT_SECONDS);
  const playerLeftToast = useRef(false);

  useEffect(() => {
    if (game?.playerLeft) {
      toast.warning("Opponent left - no replay!");
      playerLeftToast.current = true;
    }
  }, [game?.playerLeft]);

  useEffect(() => {
    if (!game || game.status !== "playing") {
      setTimeLeft(TURN_TIMEOUT_SECONDS);
      return;
    }
    const updateTimeLeft = () => {
      const seconds = Math.floor((Date.now() - game.lastMove) / 1000);
      const remainSecond = Math.max(0, TURN_TIMEOUT_SECONDS - seconds);
      setTimeLeft(remainSecond);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [game?.status, game?.lastMove]);

  if (error && !game) {
    return (
      <div className="text-white text-center p-8">
        <div className="mb-4">{error}</div>
        <button
          className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          onClick={() => navigate("/")}
        >
          Back to home
        </button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-white text-center p-8">
        {t("game.loading", { defaultValue: "Loading game..." })}
      </div>
    );
  }

  const { board, currentPlayer, status, winner, toDisapear } = game;

  if (status === "waiting" && playerRole === "X") {
    const urlInvit = `${window.location.origin}/game/${gameId}`;
    return (
      <div className="text-center p-10">
        <h2> Waiting for oppenent...</h2>
        <p>Share this link to invite someone:</p>
        <div className="flex gap-2 justify-center mt-4">
          <Input readOnly value={urlInvit} className="..."></Input>
          <Button onClick={() => navigator.clipboard.writeText(urlInvit)}>
            Copy
          </Button>
        </div>
        <Button
          onClick={() => {
            // client;
            navigate("/");
          }}
        >
          leave the game
        </Button>
      </div>
    );
  }

  const playerXName = game.playerProfiles?.X?.username || "Player X";
  const playerOName = game.playerProfiles?.O?.username || "Player O";
  const playerXAvatar = game.playerProfiles?.X?.avatar;
  const playerOAvatar = game.playerProfiles?.O?.avatar;

  const flatBoard: CellValue[] = board.flat();
  const showPopup = status === "finished" && game.endReason !== null;

  const canPlay =
    status === "playing" &&
    (playerRole === "X" || playerRole === "O") &&
    playerRole === currentPlayer;

  const hasReplayRole = playerRole === "X" || playerRole === "O";

  const waitingReplayOtherPlayer =
    status === "finished" &&
    hasReplayRole &&
    ((playerRole === "X" && game.replayVotes.X && !game.replayVotes.O) ||
      (playerRole === "O" && game.replayVotes.O && !game.replayVotes.X));

  const playerXNameTrunc = truncateUserName(playerXName);
  const playerONameTrunc = truncateUserName(playerOName);
  const endGameMessage = getEndGameMessage(
    game.endReason,
    winner,
    playerXNameTrunc,
    playerONameTrunc,
  );

  return (
    <div className="relative inline-block text-center p-4">
      {status !== "finished" && (
        <div
          className={`mb-6 py-2 rounded-lg text-xl font-bold shadow-md ${
            currentPlayer === "X"
              ? "bg-cyan-500 text-white"
              : "bg-fuchsia-500 text-white"
          }`}
        >
          {currentPlayer === "X"
            ? t("game.turn", {
                defaultValue: "{{player}}'s turn {{symbol}}",
                player: playerXNameTrunc,
                symbol: "X",
              })
            : t("game.turn", {
                defaultValue: "{{player}}'s turn {{symbol}}",
                player: playerONameTrunc,
                symbol: "O",
              })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8 text-white">
        <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
          {playerXAvatar ? (
            <img
              src={playerXAvatar}
              className="w-12 h-12 rounded-full mb-2"
              alt="player X"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
              {playerXName[0]}
            </div>
          )}
          <p className="font-bold">{playerXNameTrunc}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded flex flex-col items-center justify-center">
          <p className="text-sm">{t("game.vs", { defaultValue: "VS" })}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
          {playerOAvatar ? (
            <img
              src={playerOAvatar}
              className="w-12 h-12 rounded-full mb-2"
              alt="player O"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
              {playerOName[0]}
            </div>
          )}
          <p className="font-bold">{playerONameTrunc}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-500/20 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-white/70">
        {playerRole === "X" &&
          t("game.roleX", { defaultValue: "You are player X" })}
        {playerRole === "O" &&
          t("game.roleO", { defaultValue: "You are player O" })}
        {playerRole === "spectator" &&
          t("game.spectating", { defaultValue: "You are spectating" })}
        {playerRole === null &&
          t("game.joining", { defaultValue: "Joining game..." })}
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

      {showPopup && (
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

            <div className="mt-4 text-gray-600 font-medium">
              {t("game.score", { defaultValue: "Score" })} — X: {game.scores.X}{" "}
              | O: {game.scores.O} | D: {game.scores.D}
            </div>

            <p className="text-sm text-gray-500 text-center">
              {game.playerLeft
                ? "Opponent left - replay unavailable"
                : playerRole === "X" || playerRole === "O"
                  ? "You can request a replay"
                  : "Players try to decide whether to replay"}
            </p>

            {(playerRole === "X" || playerRole === "O") && !game.playerLeft && (
              <>
                {/* if (game.playerLeft) toast.warning("Opponent left - no replay!"); */}
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
                  — X: {game.replayVotes.X ? "✓" : "…"} | O:{" "}
                  {game.replayVotes.O ? "✓" : "…"}
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
                console.log(
                  "socket",
                  client,
                  "role",
                  playerRole,
                  "click en backhome from gameid =",
                  gameId,
                  "and send leave_game",
                );
                navigate("/");
              }}
            >
              {t("game.backHome", { defaultValue: "Back to home" })}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
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

      <div className="mt-4 text-white/80 font-medium">
        {t("game.score", { defaultValue: "Score" })} — X: {game.scores.X} | O:{" "}
        {game.scores.O} | D: {game.scores.D}
      </div>

      <div className="mt-6 text-white/60 font-medium">
        {t("game.timer", {
          defaultValue: "Time left: {{seconds}}s",
          seconds: timeLeft, //timeLeft,
        })}
      </div>

      <div>
        {typeof game.spectatCnt === "number" && game.spectatCnt > 0 && (
          <div className="mb-2 text-xs text-white/60">
            {"Spectating this game: "}
            {game.spectatCnt}{" "}
          </div>
        )}{" "}
      </div>
    </div>
  );
}
