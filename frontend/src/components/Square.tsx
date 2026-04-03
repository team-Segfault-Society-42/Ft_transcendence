import type { CellValue } from "../../../backend/src/modules/game/game.types";

type SquareProps = {
  value: CellValue;
  isWarning: boolean;
  onSquareClick: () => void;
};

export default function Square({
  value,
  isWarning,
  onSquareClick,
}: SquareProps) {
  return (
    <button
      className="h-32 w-32 rounded-xl border border-white/40 bg-white/10 text-7xl font-bold shadow-md active:scale-95 hover:bg-white/20 transition-all flex items-center justify-center"
      onClick={onSquareClick}
    >
      <span
        className={`
          ${value === "X" ? "text-cyan-400" : "text-fuchsia-400"}
          ${isWarning ? "opacity-30 scale-75" : "opacity-100"}
          transition-all duration-300
        `}
      >
        {value ?? ""}
      </span>
    </button>
  );
}
