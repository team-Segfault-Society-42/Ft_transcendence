import { NavLink } from 'react-router-dom';
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "../ui/languageSwitcher"
import { Button } from "@/components/ui/Button"

interface HeaderProps {
    onLoginClick: () => void
    user: {
        username: string
    } | null
    onLogoutClick: () => void
}

export default function Header({ onLogoutClick, onLoginClick, user }: HeaderProps) {
    const { t } = useTranslation()

    return (
        <header className="relative w-full py-6 text-white/20 border-t border-white/10 bg-black/20 backdrop-blur">

            <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <LanguageSwitcher />
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 ">
            {user ? ( 
                
                <Button className="px-4 rounded-full bg-transparent border border-border transition-all duration-200 hover:scale-105 hover:bg-white/5" onClick={onLogoutClick} >
                
                <span> {t("home.buttons.hi") + user.username} </span>
                {t("auth.buttons.logout")}

                </Button>  ) : ( 
                <Button
                    variant="secondary"
                    onClick={onLoginClick}>
                    {t("home.buttons.login")} 
                </Button> 
                )}
            </div>

                <nav className="flex justify-center gap-12 font-black uppercase text-xl">

                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive
                                ? "text-white"
                                : "text-white/40 hover:text-white transition-colors"
                        }
                    >
                        {t("header.home")}
                    </NavLink>

                    <NavLink
                        to="/game"
                        className={({ isActive }) =>
                            isActive
                                ? "text-white"
                                : "text-white/40 hover:text-white transition-colors"
                        }
                    >
                        {t("header.game")}
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive
                                ? "text-white"
                                : "text-white/40 hover:text-white transition-colors"
                        }
                    >
                        {t("header.profile")}
                    </NavLink>

                </nav>

        </header>
    )
}