import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { House, Gamepad2, UserRound, UsersRound, History, Trophy, Binoculars, BookOpenText } from "lucide-react";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { Button } from "@/components/ui/Button";

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

export function Sidebar({user, onLoginClick, onLogoutClick} : HeaderProps) {

  	const { t } = useTranslation()

  	const links = [
	{ to: "/", label: "sidebar.home", icon: House },
    { to: "/play", label: "sidebar.game", icon: Gamepad2 },
    { to: "/spectate", label: "sidebar.spectate", icon: Binoculars },
    { to: "/profile", label: "sidebar.profile", icon: UserRound },
    { to: "/leaderboard", label: "sidebar.leaderboard", icon: Trophy },
    { to: "/friends", label: "sidebar.friends", icon: UsersRound },
    { to: "/history", label: "sidebar.history", icon: History },
    { to: "/Rules", label: "sidebar.rules", icon: BookOpenText },
  ];

  	return (
	<aside className="w-64 bg-slate-900 border-r border-white/10 flex flex-col p-4">
		<div>
			<h1 className="text-xl absolute top-6 left-6 bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
				{t("sidebar.title")}
			</h1>

			<nav className="flex flex-col gap-2 mt-20">
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
		</div>

		<div className="mt-auto flex flex-col gap-3 pt-6">
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
			<div className="mt-auto flex flex-col items-center gap-3">
				<LanguageSwitcher />
			</div>
		</div>
    </aside>
  );
}
