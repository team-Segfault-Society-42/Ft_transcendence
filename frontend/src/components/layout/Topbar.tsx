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

/**
 * Displays the main application topbar.
 *
 * Contains:
 * - mobile sidebar toggle button
 * - application title
 * - authentication actions
 * - authenticated user shortcut
 */
export function Topbar({ user, onLoginClick, onMenuClick }: HeaderProps) {

  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="h-16 border-b border-white/10 flex items-center px-4 lg:px-6 overflow-visible">

      {/* LEFT SECTION */}
      <div className="flex-1 flex items-center">

        {/* MOBILE MENU BUTTON */}
        <button
          className="xl:hidden p-2 rounded-lg hover:bg-white/10 transition min-h-11 min-w-11 flex items-center justify-center"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>

      </div>

    {/* CENTER SECTION */}
    <div className="flex-1 flex items-center justify-center">

      {/* TITLE */}
      <Motion>
        <Link to="/">
          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            {t("title")}
          </h1>
        </Link>
      </Motion>
    </div>

    {/* RIGHT SECTION */}
    <div className="flex-1 flex items-center justify-end gap-2 overflow-visible">

      {/* AUTHENTICATED USER ? */}
      {user ? (
      <>

        {/* PROFILE BUTTON */}
        <Button
        onClick={() => navigate("/profile")}
        variant="secondary"
        size="sm"
        className="rounded-full px-3 gap-2 overflow-visible">

          {/* GREETING */}
          <span className= "hidden md:inline">
            {t("home.buttons.hi")}
          </span>

          {/* USERNAME */}
          <div className="hidden md:flex min-w-0 overflow-visible">
            <Username
            name={user.username}
            variant="topbar"
            />
          </div>

          {/* USER AVATAR */}
          <Avatar
          src={user.avatar ?? undefined}
          fallback={user.username[0]}
          />
        </Button>
      </>

      ) : (

      /* USER AVATAR */
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
