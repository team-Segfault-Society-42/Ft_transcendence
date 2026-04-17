import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "../ui/LanguageSwitcher"

export function Sidebar() {

  const { t } = useTranslation()

  const links = [
    { to: "/", label: "Home" },
    { to: "/game", label: "Game" },
    { to: "/profile", label: "Profile" },
    { to: "/friends", label: "Friends" },
    { to: "/chat", label: "Chat" },
  ]

  return (
    <aside className="w-64 bg-black/40 border-r border-white/10 flex flex-col p-4">

      <h1 className="text-xl font-bold mb-6">ft_transcendence</h1>

      <nav className="flex flex-col gap-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`
            }
          >
            {t(`${link.label}`)}
          </NavLink>
        ))}
      </nav>

      {/* LANGUAGE SWITCHER */}
      <div className="mt-auto pt-6">
        <LanguageSwitcher/>
      </div>

    </aside>
  )
}