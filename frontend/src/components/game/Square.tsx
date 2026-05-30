import type { CellValue } from "../../type/game.types";
import { squareClasses } from "@/styles/gameChatClasses";

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
      className={squareClasses.button}
      onClick={onSquareClick}
    >
      <span
        className={`${squareClasses.value} ${
          value === "X" ? squareClasses.xValue : squareClasses.oValue
        } ${isWarning ? squareClasses.warning : squareClasses.normal}`}
      >
        {value ?? ""}
      </span>
    </button>
  );
}
