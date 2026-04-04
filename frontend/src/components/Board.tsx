import Square from "./Square";
import { useGameStore } from "../Store/gameStore";
import type { CellValue } from "../type/game.types";

type Player = {
  id: number;
  nickname: string;
  avatar: string;
};

type BoardProps = {
  players: { X: Player; O: Player };
};

export default function Board({ players }: BoardProps) {
  const { game, error, playMove, playerRole } = useGameStore();

  if (!game) {
    return <div className="text-white text-center p-8">Loading game...</div>;
  }

  const { board, currentPlayer, status, winner, toDisapear } = game;

  const flatBoard: CellValue[] = board.flat();
  const showPopup = status === "finished" && winner !== null;

  const canPlay =
    status === "playing" &&
    (playerRole === "X" || playerRole === "O") &&
    playerRole === currentPlayer;

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
          ? `${players.X.nickname}'s Turn X`
          : `${players.O.nickname}'s Turn O`}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 text-white">
        <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
          {players.X.avatar ? (
            <img
              src={players.X.avatar}
              className="w-12 h-12 rounded-full mb-2"
              alt="player X"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
              {players.X.nickname[0]}
            </div>
          )}
          <p className="font-bold">{players.X.nickname}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded flex flex-col items-center justify-center">
          <p className="text-sm">VS</p>
        </div>

        <div className="bg-gray-800 p-4 rounded flex flex-col items-center">
          {players.O.avatar ? (
            <img
              src={players.O.avatar}
              className="w-12 h-12 rounded-full mb-2"
              alt="player O"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
              {players.O.nickname[0]}
            </div>
          )}
          <p className="font-bold">{players.O.nickname}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-500/20 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-white/70">
        {playerRole === "X" && "You are player X"}
        {playerRole === "O" && "You are player O"}
        {playerRole === "spectator" && "You are spectating"}
        {playerRole === null && "Joining game..."}
      </div>

      {status === "waiting" && (
        <div className="mb-4 rounded-lg border border-yellow-400 bg-yellow-500/20 px-4 py-3 text-yellow-100">
          Waiting for opponent...
        </div>
      )}

      {status === "finished" && game.endReason === "draw" && (
        <div className="mb-4 rounded-lg border border-slate-400 bg-slate-500/20 px-4 py-3 text-slate-100">
          Draw game
        </div>
      )}

      {status === "finished" && game.endReason === "timeout" && (
        <div className="mb-4 rounded-lg border border-orange-400 bg-orange-500/20 px-4 py-3 text-orange-100">
          Win by timeout
        </div>
      )}

      {showPopup && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-40">
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            <h2
              className={`text-2xl font-bold mb-4 ${
                winner === "X" ? "text-cyan-500" : "text-fuchsia-500"
              }`}
            >
              🎉 {players[winner].nickname} WINS!
            </h2>
          </div>
          <button
            className={`mb-6 py-2 rounded-lg text-xl font-bold shadow-md`}
          >
            Replay
          </button>
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
        Score — X: {game.scores.X} | O: {game.scores.O} | D: {game.scores.D}
      </div>

      <p className="mt-6 text-white/60 font-medium italic">2 players mode</p>
    </div>
  );
}
