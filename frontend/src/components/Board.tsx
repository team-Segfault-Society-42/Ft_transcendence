import Square from "./Square";
import { useGameStore } from "../Store/gameStore";
<<<<<<< HEAD
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"

type Player = {
	id: number;
	nickname: string;
	avatar: string;
};

type BoardProps = {
	players: { X: Player; O: Player };
};

export default function Board({ players }: BoardProps) {

	const {
		isXturn,
		grid,
		queue,
		idx,
		history,
		showPopup,
		winner,
		scores,
		resetSession,
		replayGame,
		playMove
		} = useGameStore()

	const toDisapear = idx > 5 ? queue[idx % 6] : -1
	
	console.log(queue)
	console.log(idx)
	console.log(history)

	const { t } = useTranslation()
	
	return (
		<div className="relative inline-block text-center p-4">

			<div className={`mb-6 py-2 rounded-lg text-xl font-bold shadow-md ${!isXturn ? "bg-cyan-500 text-white" : "bg-fuchsia-500 text-white"}`}>
				{isXturn
  					? t("game.turn", { player: players.O.nickname, symbol: "O" })
  					: t("game.turn", { player: players.X.nickname, symbol: "X" })
				}
			</div>

			<div className="grid grid-cols-3 gap-4 mb-8 text-white">
				<div className="bg-gray-800 p-4 rounded flex flex-col items-center">
					{players.X.avatar ? (
						<img src={players.X.avatar} className="w-12 h-12 rounded-full mb-2" alt="p1" />
					) : (
						<div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
							{players.X.nickname[0]}
						</div>
					)}
					<p className="font-bold">{players.X.nickname}</p>
					<p className="text-xl">{scores.x}</p>
				</div>

				<div className="bg-gray-700 p-4 rounded flex flex-col items-center justify-center">
					<p className="text-sm">
						{t("game.vs")}
					</p>
				</div>

				<div className="bg-gray-800 p-4 rounded flex flex-col items-center">
					{players.O.avatar ? (
						<img src={players.O.avatar} className="w-12 h-12 rounded-full mb-2" alt="p2" />
					) : (
						<div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
							{players.O.nickname[0]}
						</div>
					)}
					<p className="font-bold">{players.O.nickname}</p>
					<p className="text-xl">{scores.o}</p>
				</div>
			</div>

			{
				showPopup && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-40">
						<div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">

							<h2
								className={`text-2xl font-bold mb-4 ${
									winner === "X"
										? "text-cyan-500"
										: "text-fuchsia-500"
								}`}>
								🎉 {players[winner as 'X' | 'O'].nickname} {t("game.wins")}
							</h2>

							<button
								className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
								onClick={replayGame}>
								{t("game.replay")}
							</button>
						</div>
					</div>
				)
			}
			<div className="grid grid-cols-3 gap-3">
				{grid.map((value, i) => (
					<Square key={i} value={value} onSquareClick={() => playMove(i)} isWarning={i === toDisapear}/>
				))}
			</div>

			<p className="mt-6 text-white/60 font-medium italic">
				{t("game.mode")}
			</p>

			<Button
				variant="secondary"
				className="mt-6"
				onClick={resetSession}>
				{t("game.reset")}
			</Button>
		</div >
	)
}
=======
import type { CellValue } from "../type/game.types";
import { useTranslation } from "react-i18next";

export default function Board() {
  const { game, error, playMove, playerRole, requestReplay } = useGameStore();
  const { t } = useTranslation();

  if (!game) {
    return (
      <div className="text-white text-center p-8">
        {t("game.loading", { defaultValue: "Loading game..." })}
      </div>
    );
  }

  const { board, currentPlayer, status, winner, toDisapear } = game;

  const playerXName = game.playerProfiles?.X?.username || "Player X";
  const playerOName = game.playerProfiles?.O?.username || "Player O";
  const playerXAvatar = game.playerProfiles?.X?.avatar;
  const playerOAvatar = game.playerProfiles?.O?.avatar;

  const flatBoard: CellValue[] = board.flat();
  const showPopup =
    status === "finished" && winner !== null && game.endReason === "win";

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

  return (
    <div className="relative inline-block text-center p-4">
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
              player: playerXName,
              symbol: "X",
            })
          : t("game.turn", {
              defaultValue: "{{player}}'s turn {{symbol}}",
              player: playerOName,
              symbol: "O",
            })}
      </div>

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
          <p className="font-bold">{playerXName}</p>
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
          <p className="font-bold">{playerOName}</p>
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

      {status === "finished" && game.endReason === "draw" && (
        <div className="mb-4 rounded-lg border border-slate-400 bg-slate-500/20 px-4 py-3 text-slate-100">
          {t("game.draw", { defaultValue: "Draw game" })}
        </div>
      )}

      {status === "finished" && game.endReason === "timeout" && (
        <div className="mb-4 rounded-lg border border-orange-400 bg-orange-500/20 px-4 py-3 text-orange-100">
          {t("game.timeoutWin", { defaultValue: "Win by timeout" })}
        </div>
      )}

      {status === "finished" && game.endReason === "forfeit" && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-500/20 px-4 py-3 text-red-100">
          {t("game.forfeitWin", {
            defaultValue: "Win by opponent leaving the match",
          })}
        </div>
      )}

      {waitingReplayOtherPlayer && (
        <div className="mb-4 rounded-lg border border-fuchsia-400 bg-fuchsia-500/20 px-4 py-3 text-fuchsia-100">
          {t("game.waitingReplayOther", {
            defaultValue: "Replay requested. Waiting for the other player...",
          })}
        </div>
      )}

      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-40">
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center gap-4 min-w-[320px]">
            <h2
              className={`text-2xl font-bold ${
                winner === "X" ? "text-cyan-500" : "text-fuchsia-500"
              }`}
            >
              🎉{" "}
              {t("game.wins", {
                defaultValue: "{{player}} wins!",
                player: winner === "X" ? playerXName : playerOName,
              })}
            </h2>

            {status === "finished" && game.endReason === "timeout" && (
              <p className="text-sm text-orange-500 font-medium">
                {t("game.timeoutWin", { defaultValue: "Win by timeout" })}
              </p>
            )}

            {status === "finished" && game.endReason === "forfeit" && (
              <p className="text-sm text-red-500 font-medium">
                {t("game.forfeitWin", {
                  defaultValue: "Win by opponent leaving the match",
                })}
              </p>
            )}

            {(playerRole === "X" || playerRole === "O") && (
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
                  — X: {game.replayVotes.X ? "✓" : "…"} | O:{" "}
                  {game.replayVotes.O ? "✓" : "…"}
                </p>

                {((playerRole === "X" &&
                  game.replayVotes.X &&
                  !game.replayVotes.O) ||
                  (playerRole === "O" &&
                    game.replayVotes.O &&
                    !game.replayVotes.X)) && (
                  <p className="text-sm text-fuchsia-500 font-medium">
                    {t("game.waitingReplayOther", {
                      defaultValue: "Waiting for the other player...",
                    })}
                  </p>
                )}
              </>
            )}
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

      <p className="mt-6 text-white/60 font-medium italic">
        {t("game.mode", { defaultValue: "2 players mode" })}
      </p>
    </div>
  );
}
>>>>>>> dev
