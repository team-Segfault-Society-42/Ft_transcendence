import { Avatar } from "@/components/ui/Avatar"
import LanguageSwitcher from "../ui/LanguageSwitcher"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next"

interface User {
  username: string
  avatar?: string
  wins?: number
  losses?: number
}

interface HeaderProps {
  user: User | null
  onLoginClick: () => void
  onLogoutClick: () => void
}

export function Topbar({ user, onLoginClick, onLogoutClick }: HeaderProps) {

  const { t } = useTranslation()

  const total = (user?.wins || 0) + (user?.losses || 0)
  const winrate = total > 0 ? (user!.wins! / total) * 100 : 0

  return (
    <header className="h-16 min-h-16 border-b border-white/10 flex items-center justify-end px-6 gap-6">

      {/* LANGUAGE */}
      <LanguageSwitcher />

      {user ? (
    <>

    {/* STATS */}
    <div className="text-right">
      <p className="text-sm text-white/60">Winrate</p>
      <p className="font-bold text-cyan-400">
        {winrate.toFixed(1)}%
      </p>
    </div>

    {/* AVATAR */}
    <Avatar
      src={user.avatar}
      fallback={user.username[0]}
    />

    {/* LOGOUT */}
    <Button 
      onClick={onLogoutClick}>
      <span>
        {t("home.buttons.hi")} {user.username} {t("auth.buttons.logout")}
      </span>
      </Button> </> ) : ( 
                
      <Button
          onClick={onLoginClick}>
          {t("home.buttons.login")} 
      </Button> 
      )}

    </header>
  )
}