import { useTranslation } from "react-i18next"
import { History } from "lucide-react"


export function GameHistoryEmpty() {
    const { t } = useTranslation()

    return (
    <div className="flex flex-col items-center justify-center text-center h-full gap-4">

        <div className="w-14 h-14 rounded-full border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <History size={24} />
        </div>

        <p className="text-sm text-white/60 max-w-xs">
            {t("home.history.empty")}
        </p>

    </div>
  )
}