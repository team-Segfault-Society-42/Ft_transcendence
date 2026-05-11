import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { Username } from "@/components/ui/Username";
import { Motion } from "@/components/ui/Motion";
import { Link, useNavigate } from "react-router-dom";

interface User {
  username: string
  avatar?: string
  wins?: number
  losses?: number
}

interface HeaderProps {
  user: User | null
  onLoginClick: () => void
}

export function Topbar({ user, onLoginClick}: HeaderProps) {

  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="relative h-16 min-h-20 border-b border-white/10 flex items-center justify-between px-6">

    <div className="w-24" />

    <div className="absolute left-1/2 -translate-x-1/2">
      <Motion>
      <Link to="/">
        <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
      </Link>
      </Motion>
    </div>

    <div className="flex items-center gap-4">
      {user ? (
      <>
      <div className="flex items-center h-10 font-bold text-lg">
        <Button
        onClick={() => navigate("/profile")}
        variant="secondary"
        className="rounded-full px-3 gap-2">

          <span>
            {t("home.buttons.hi")}
          </span>

          <Username
          name={user.username}
          variant="topbar"
          />

          <Avatar
          src={user.avatar}
          fallback={user.username[0]}
          />
        </Button>
      </div>

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
