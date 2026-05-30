import { User, Clock, Trophy, Brain, Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

interface RuleProps {
	icon: ReactNode;
	title: string;
	desc: string;
}

/**
 * Displays the main game rules component.
 *
 * Explains:
 * - maximum symbols per player
 * - disappearing symbols mechanic
 * - win condition
 * - strategy aspect
 * - draw condition
 */
export function GameRules() {
    const { t } = useTranslation()

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm w-full max-w-sm">

            {/* RULES LIST */}
            <div className="space-y-4">

                {/* MAX SYMBOLS RULE */}
                <Rule
                    icon={<User className="text-cyan-400" size={18} />}
                    title={t("game.rules.maxSymbols.title")}
                    desc={t("game.rules.maxSymbols.desc")}
                />

                {/* DISAPPEARING SYMBOLS RULE */}
                <Rule
                    icon={<Clock className="text-pink-400" size={18} />}
                    title={t("game.rules.disappear.title")}
                    desc={t("game.rules.disappear.desc")}
                />

                {/* WIN CONDITION RULE */}
                <Rule
                    icon={<Trophy className="text-purple-400" size={18} />}
                    title={t("game.rules.win.title")}
                    desc={t("game.rules.win.desc")}
                />

                {/* STRATEGY RULE */}
                <Rule
                    icon={<Brain className="text-green-400" size={18} />}
                    title={t("game.rules.strategy.title")}
                    desc={t("game.rules.strategy.desc")}
                />

                {/* DRAW CONDITION RULE */}
                <Rule
                    icon={<Handshake className="text-yellow-400" size={18} />}
                    title={t("game.rules.draw.title")}
                    desc={t("game.rules.draw.desc")}
                />

            </div>
        </div>
    )
}

/**
 * Displays a single game rule item.
 *
 * Contains:
 * - rule icon
 * - rule title
 * - rule description
 */
function Rule({ icon, title, desc }: RuleProps) {
    return (
        <div className="flex gap-3 items-start">

            {/* RULE ICON */}
			<div className="w-5 flex justify-center pt-1 shrink-0">
				{icon}
			</div>

            {/* RULE CONTENT */}
			<div>

                {/* RULE TITLE */}
				<p className="text-white font-medium">
					{title}
				</p>

                {/* RULE DESCRIPTION */}
				<p className="text-white/50 text-sm">
					{desc}
				</p>
			</div>
		</div>
    )
}