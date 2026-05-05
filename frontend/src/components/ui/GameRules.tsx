import { User, Clock, Trophy, Brain } from "lucide-react"
import { useTranslation } from "react-i18next"

export function GameRules() {
    const { t } = useTranslation()

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm w-full max-w-sm">

            <div className="space-y-4">

            <Rule
                icon={<User className="text-cyan-400 mt-1" size={18} />}
                title={t("game.rules.maxSymbols.title")}
                desc={t("game.rules.maxSymbols.desc")}
            />

            <Rule
                icon={<Clock className="text-pink-400 mt-1" size={18} />}
                title={t("game.rules.disappear.title")}
                desc={t("game.rules.disappear.desc")}
            />

            <Rule
                icon={<Trophy className="text-purple-400 mt-1" size={18} />}
                title={t("game.rules.win.title")}
                desc={t("game.rules.win.desc")}
            />

            <Rule
                icon={<Brain className="text-cyan-300 mt-1" size={18} />}
                title={t("game.rules.strategy.title")}
                desc={t("game.rules.strategy.desc")}
            />

            </div>
        </div>
    )
}

function Rule({ icon, title, desc }: any) {
    return (
        <div className="flex gap-3 items-start">
            {icon}
            <div>
                <p className="text-white font-medium">{title}</p>
                <p className="text-white/50 text-sm">{desc}</p>
            </div>
        </div>
    )
}