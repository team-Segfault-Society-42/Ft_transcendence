import { useTranslation } from "react-i18next";
import { Avatar } from "../ui/Avatar";
import { Username } from "../ui/Username";
import { Card } from "../ui/Card";

type Props = {
  playerXName: string;
  playerOName: string;
  playerXAvatar: string | undefined;
  playerOAvatar: string | undefined;
  currentPlayer: string;
};

export function PlayerCards({
  playerXName,
  playerOName,
  playerXAvatar,
  playerOAvatar,
  currentPlayer,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-3 gap-4 mb-8 text-white">
      {/* PLAYER CARD X */}
      <Card
        className={`flex flex-col items-center ${currentPlayer === "X" ? "ring-2 ring-cyan-400" : ""}`}
      >
        <p>X</p>
        <Avatar src={playerXAvatar} alt="player X" fallback={playerXName[0]} />
        <Username name={playerXName} variant="card" className="font-bold" />
      </Card>

      {/* VS CARD */}
      <Card className="bg-gray-700 p-4 rounded flex flex-col items-center justify-center">
        <p className="text-sm">{t("game.vs", { defaultValue: "VS" })}</p>
      </Card>

      {/* PLAYER CARD O */}
      <Card
        className={`flex flex-col items-center ${currentPlayer === "O" ? "ring-2 ring-cyan-400" : ""}`}
      >
        <p>O</p>
        <Avatar src={playerOAvatar} alt="player O" fallback={playerOName[0]} />
        <Username name={playerOName} variant="card" className="font-bold" />
      </Card>
    </div>
  );
}
