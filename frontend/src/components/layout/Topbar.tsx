import { Avatar } from "@/components/ui/Avatar"
import LanguageSwitcher from "../ui/LanguageSwitcher"
import { Button } from "@/components/ui/Button"
import { useTranslation } from "react-i18next"
import { Username } from "@/components/ui/Username";
import { Motion } from "@/components/ui/Motion";


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

  return (
    <header className="relative h-16 min-h-20 border-b border-white/10 flex items-center justify-between px-6">

    <div className="flex items-center gap-4">
      <LanguageSwitcher />
    </div>

    <div className="absolute left-1/2 -translate-x-1/2">
      <Motion>
        <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
      </Motion>
    </div>

    <div className="flex items-center gap-4">
      {user ? (
      <>
      <Avatar
        src={user.avatar}
        fallback={user.username[0]}/>

      <Button
        onClick={onLogoutClick}
        variant="secondary"
        className="flex items-center gap-2 min-w-0">
        <span>
          {t("home.buttons.hi")}
        </span>
          <Username
            name={user.username}
            variant="topbar"
          />
        <span>
          {t("auth.buttons.logout")}
        </span>
      </Button>


      </>

      ) : (

      <Button
          onClick={onLoginClick}
          variant="secondary">
          {t("home.buttons.login")}
      </Button>
      )}

    </div>

    </header>
  )
}
