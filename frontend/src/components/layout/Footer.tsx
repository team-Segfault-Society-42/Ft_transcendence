import { NavLink } from 'react-router-dom';
import { useTranslation } from "react-i18next"

export default function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="w-full border-t border-white/10 bg-black/20 backdrop-blur text-white/40">

            <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center">

                <div className="text-white/60 font-semibold">
                    {t("footer.projectname")}
                </div>

                <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 uppercase tracking-wide text-sm">

                    <NavLink
                        to="/privacy"
                        className={({ isActive }) =>
                            isActive
                                ? "text-white"
                                : "hover:text-white transition-colors"
                        }>
                        {t("footer.privacy")}
                    </NavLink>

                    <NavLink
                        to="/terms"
                        className={({ isActive }) =>
                            isActive
                                ? "text-white"
                                : "hover:text-white transition-colors"
                        }>
                        {t("footer.terms")}
                    </NavLink>

                </nav>

                <div className="ml-auto text-xs text-white/30">
                    © {new Date().getFullYear()}
                </div>

            </div>

        </footer>
    )
}