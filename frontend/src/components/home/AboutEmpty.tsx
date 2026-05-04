import { useTranslation } from "react-i18next"
import { Card, CardTitle } from "@/components/ui/Card"


export function AboutEmpty() {
    const { t } = useTranslation()

    return (
        <Card className="h-full relative flex items-center justify-center bg-slate-900">

            <CardTitle className="absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                {t("profile.about.title")}
            </CardTitle>

            <div className="flex flex-col items-center justify-center text-center gap-4 pt-20 pb-20">
                <div className="w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                    <span className="text-xl font-bold">
                        ?
                    </span>
                </div>
            
                <div>           
                    <p className="text-white font-medium">
                    {t("profile.about.notConnected")}
                    </p>

                    <p className="text-sm text-white/40 mt-2">
                    {t("profile.about.login")}
                    </p>
                </div>
          
            </div>
        </Card>
  )
}