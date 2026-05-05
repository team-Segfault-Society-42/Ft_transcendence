import { Card, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next";
import { GameInfo } from "../ui/GameInfo";
import { GameRules } from "../ui/GameRules";

type Props = {
  createGame: () => void
  user: any
}

export function PlayCard({ createGame: onCreateGame, user }: Props) {
    const { t } = useTranslation();

    if (!user) {
    return (
      <Card className="min-h-120 relative flex flex-col items-center justify-center bg-slate-900">

        <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("game.howToPlay")}
        </CardTitle>

        <GameRules/>
      
      </Card>
    )
  }

  return (
    
    <Card className="min-h-80 h-full relative flex items-center justify-center bg-slate-900">

      <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        {t("home.play.title")}
      </CardTitle>

        <div className="flex flex-col gap-4 max-w-md mt-12">

        <GameInfo/>

        <Button
          onClick={() => console.log("play local later")}
          size="lg"
          className="w-full">
          {t("home.buttons.join")}
        </Button>

        <Button
          variant="danger"
          onClick={onCreateGame}
          size="lg"
          className="w-full">
          Watch a game
        </Button>

        <Button
          onClick={onCreateGame}
          size="lg"
          className="w-full">
          {t("home.buttons.create")}
        </Button>

      </div>
    </Card>
  )
}