import { Card, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next";

type Props = {
  onFindOpponent: () => void
}

export function PlayCard({ onFindOpponent }: Props) {
    const { t } = useTranslation();

  return (
    <Card className="min-h-80 h-full relative flex items-center justify-center">

      <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        {t("home.play.title")}
      </CardTitle>

        <div className="flex flex-col gap-4 max-w-md">

        <Button
          onClick={() => console.log("play local later")}
          size="lg"
          className="w-full">
          {t("home.buttons.local")}
        </Button>

        <Button
          onClick={onFindOpponent}
          size="lg"
          className="w-full">
          {t("home.buttons.findOpp")}
        </Button>

      </div>
    </Card>
  )
}