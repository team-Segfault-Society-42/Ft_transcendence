import { Card, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next";

export function PlayCard({ onFindOpponent }: any) {
    const { t } = useTranslation();

  return (
    <Card className="h-full">

      <CardTitle className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
        Play
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