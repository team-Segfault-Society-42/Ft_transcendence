import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";
import { Username } from "@/components/ui/Username";
import { Motion } from "@/components/ui/Motion";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@/type/user.types";
import { Menu } from "lucide-react";

interface HeaderProps {
  user: User | null
  onLoginClick: () => void
  onMenuClick: () => void
}

export function Topbar({ user, onLoginClick, onMenuClick }: HeaderProps) {

  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="h-16 border-b border-white/10 flex items-center px-4 lg:px-6">
      <div className="flex-1 flex items-center">
    <button
      className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition min-h-11 min-w-11 flex items-center justify-center"
      onClick={onMenuClick}
      aria-label="Ouvrir le menu"
    >
      <Menu size={22} />
    </button>

      </div>

    <div className="flex-1 flex items-center justify-center">
      <Motion>
      <Link to="/">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
      </Link>
      </Motion>
    </div>

    <div className="flex-1 flex items-center justify-end gap-2">
      {user ? (
      <>
        <Button
        onClick={() => navigate("/profile")}
        variant="secondary"
        size="sm"
        className="rounded-full px-3 gap-2">

          <span className= "hidden sm:inline">
            {t("home.buttons.hi")}
          </span>

          <Username
          name={user.username}
          variant="topbar"
          className="hidden sm:inline"
          />

          <Avatar
          src={user.avatar ?? undefined}
          fallback={user.username[0]}
          />
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
