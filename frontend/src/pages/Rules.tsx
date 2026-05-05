import { useTranslation } from "react-i18next"
import { Card, CardTitle } from "@/components/ui/Card"
import { GameRules } from "@/components/ui/GameRules"

export default function Rules(){
    const { t } = useTranslation()

    return (

        <section className="w-full max-w-3xl mx-auto px-6 py-10">
            <Card className="h-full relative flex items-center justify-center bg-slate-900">
                <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                    {t("game.howToPlay")}
                </CardTitle>
                <div className="pt-20 pb-20">
                    <GameRules />
                </div>
            </Card>
        </section>

    )
}