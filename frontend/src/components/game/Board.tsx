import Square from "./Square";
import { useGameStore } from "../../Store/gameStore";
import type { CellValue } from "../../type/game.types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { getEndGameMessage, truncateUserName } from "./boardHelpers";
import { Gamepad2 } from "lucide-react";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useGameTimer } from "../hooks/useGameTimer";
import { PlayerCards } from "./PlayerCards";
import { GameStatusBanner } from "./GameStatusBanner";
import { EndGamePopup } from "./EndGamePopup";

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

  const playerLeftToast = useRef(false);
  const oldOppDiscnct = useRef(false);

  const xDisconnect =
    game?.players.X.socketId === null && game.players.X.ownerUserId !== null;
  const oDisconnect =
    game?.players.O.socketId === null && game.players.O.ownerUserId !== null;
  const opponentDisconnect =
    playerRole === "X" ? oDisconnect : playerRole === "O" ? xDisconnect : false;

  useEffect(() => {
    if (game?.playerLeft) {
      toast.warning("Opponent left - no replay!");
      playerLeftToast.current = true;
    }
  }, [game?.playerLeft]);

  useEffect(() => {
    if (oldOppDiscnct.current && !opponentDisconnect) {
      toast.success("Opponent reconnected!");
    }
    oldOppDiscnct.current = opponentDisconnect;
  }, [opponentDisconnect]);
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
      <section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
        <EmptyStateCard
          title={t("game.title")}
          icon={<Gamepad2 size={24} />}
          message={t("game.notConnected")}
          description={t("game.login")}
        />
      </section>
    );
  }

  const { board, currentPlayer, status, winner, toDisapear } = game;

  const playerXName = game.playerProfiles?.X?.username || "Player X";
  const playerOName = game.playerProfiles?.O?.username || "Player O";
  const playerXAvatar = game.playerProfiles?.X?.avatar ?? undefined;
  const playerOAvatar = game.playerProfiles?.O?.avatar ?? undefined;

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
      <PlayerCards
        playerXName={playerXNameTrunc}
        playerOName={playerONameTrunc}
        playerXAvatar={playerXAvatar}
        playerOAvatar={playerOAvatar}
        currentPlayer={currentPlayer}
      />

      <GameStatusBanner
        error={error}
        status={status}
        playerRole={playerRole}
        canPlay={canPlay}
        hasReplayRole={hasReplayRole}
        opponentDisconnect={opponentDisconnect}
      ></GameStatusBanner>

      {/* ShowPopop */}
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
        ></EndGamePopup>
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

      <div className="mt-6 text-white/60 font-medium">
        {t("game.timer", {
          defaultValue: "Time left: {{seconds}}s",
          seconds: timeLeft,
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
