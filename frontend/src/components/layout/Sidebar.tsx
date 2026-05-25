import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { House, Gamepad2, UserRound, UsersRound, History, Trophy, Binoculars, BookOpenText, Settings as SettingsIcon } from "lucide-react";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import type { User } from "@/type/user.types";

interface HeaderProps {
	user: User | null
	onLoginClick: () => void
	onLogoutClick: () => void
	isOpen: boolean;
  	onClose: () => void;
}

/**
 * Displays the main application sidebar navigation.
 *
 * Contains:
 * - navigation links
 * - authentication actions
 * - language switcher
 *
 * Supports:
 * - mobile sidebar toggle
 * - active route highlighting
 */
export function Sidebar({user, onLoginClick, onLogoutClick, isOpen, onClose} : HeaderProps) {

  	const { t } = useTranslation()

	{/* SIDEBAR NAVIGATION LINKS */}
  	const links = [
	{ to: "/", label: "sidebar.home", icon: House },
    { to: "/play", label: "sidebar.game", icon: Gamepad2 },
    { to: "/spectate", label: "sidebar.spectate", icon: Binoculars },
    { to: "/profile", label: "sidebar.profile", icon: UserRound },
    { to: "/settings", label: "sidebar.settings", icon: SettingsIcon },
    { to: "/leaderboard", label: "sidebar.leaderboard", icon: Trophy },
    { to: "/friends", label: "sidebar.friends", icon: UsersRound },
    { to: "/history", label: "sidebar.history", icon: History },
    { to: "/Rules", label: "sidebar.rules", icon: BookOpenText },
  ];

  	return (
	<>

	{/* MOBILE OVERLAY */}
	{isOpen && (
		<div className="fixed inset-0 bg-black/50 z-40 xl:hidden"
		onClick={onClose}
		/>
	)}

	{/* SIDEBAR */}
	<aside className={`
		fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 flex flex-col p-4 overflow-y-auto
		transform transition-transform duration-300
		${isOpen ? "translate-x-0" : "-translate-x-full"}
		xl:relative xl:translate-x-0 xl:z-auto
	  `}>

		{/* SIDEBAR TOP SECTION */}
		<div>

			{/* SIDEBAR TITLE */}
			<h1 className="text-xl absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				{t("sidebar.title")}
			</h1>

			{/* NAVIGATION LINKS */}
			<nav className="flex flex-col gap-2 mt-20">
				{links.map(link => {
				const Icon = link.icon
				return (
					<NavLink
					key={link.to}
					to={link.to}
					onClick={onClose}
					className={({ isActive }) =>
					`flex items-center gap-3 px-4 py-2 rounded-lg transition min-h-11 ${
					isActive ? "bg-white/10" : "hover:bg-white/5"}`
					}
					>

					{/* ICON */}
					<Icon size={18} />
						{t(`${link.label}`)}
					</NavLink>
				)})}
			</nav>
		</div>

		{/* SIDEBAR BOTTOM SECTION */}
		<div className="mt-auto flex flex-col gap-3 pt-6">

			{/* AUTHENTICATION BUTTON */}
			{user ? (
				<Button
				onClick={onLogoutClick}
				variant="secondary"
				className="w-full"
				>
					{t("auth.buttons.logout")}
				</Button>
			) : (
				<Button
				onClick={onLoginClick}
				variant="secondary"
				className="w-full"
				>
					{t("home.buttons.login")}
				</Button>
			)}

			{/* LANGUAGE SWITCHER */}
			<div className="mt-auto flex flex-col items-center gap-3">
				<LanguageSwitcher />
			</div>
		</div>
    </aside>
  </>
  );
}
