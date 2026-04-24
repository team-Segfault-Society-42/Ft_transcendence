import { Card, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next";

type Props = {
  onFindOpponent: () => void
}

export function PlayCard({ onFindOpponent }: Props) {
    const { t } = useTranslation();

  return (
    <Card className="h-full">

      <CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        {t("home.play.title")}
      </CardTitle>

      <div className="flex flex-col gap-4 mt-6">

      <Button
        onClick={() => console.log("play local later")}
        size="xl">
        {t("home.buttons.local")}
      </Button>

      <Button
        onClick={onFindOpponent}
        size="xl">
        {t("home.buttons.findOpp")}
      </Button>

      </div>

    </Card>
  )
}