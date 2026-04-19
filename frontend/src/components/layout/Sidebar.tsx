import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { House, Gamepad2, UserRound, UsersRound, MessageCircle } from "lucide-react"

export function Sidebar() {

  const { t } = useTranslation()

  const links = [
    { to: "/", label: "Home", icon: House },
    { to: "/game", label: "Game", icon: Gamepad2 },
    { to: "/profile", label: "Profile", icon: UserRound },
    { to: "/friends", label: "Friends", icon: UsersRound },
    { to: "/chat", label: "Chat", icon: MessageCircle },
  ]

  return (
    <aside className="w-64 bg-black/40 border-r border-white/10 flex flex-col p-4">

      <h1 className="text-xl font-bold mb-10">
        {t("title")}
      </h1>

      <nav className="flex flex-col gap-2">
        {links.map(link => {
          const Icon = link.icon 
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-white/10" : "hover:bg-white/5"}`
            }
          >
            <Icon size={18} />
            {t(`${link.label}`)}
          </NavLink>
        )})}
      </nav>

    </aside>
  )
}