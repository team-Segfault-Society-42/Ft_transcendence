import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Motion } from "@/components/ui/Motion";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-white/10 bg-slate-900 backdrop-blur text-white/40">
      <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center">

        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 uppercase tracking-wide text-sm whitespace-nowrap">
          <Motion>
            <NavLink
              to="/privacy"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white transition-colors"
              }
            >
              {t("footer.privacy")}
            </NavLink>
          </Motion>

          <Motion>
            <NavLink
              to="/terms"
              className={({ isActive }) =>
                isActive ? "text-white" : "hover:text-white transition-colors"
              }
            >
              {t("footer.terms")}
            </NavLink>
          </Motion>
        </nav>
      </div>
    </footer>
  );
}
