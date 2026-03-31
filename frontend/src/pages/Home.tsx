import { Link } from 'react-router-dom'
import { useState } from 'react'
import SignupModal from "../components/layout/SignupModal"
import { useTranslation } from "react-i18next"
import  LoginModal  from '../components/layout/LoginModal.tsx'
import { Button } from "../components/ui/button"

export default function Home() {
	const [activeModal, setActiveModal] = useState<"signup" | "login" | null>(null)
	const { t } = useTranslation()

	const openLogin = () => setActiveModal("login")
	const openSignup = () => setActiveModal("signup")
	const closeModals = () => setActiveModal(null)

	return (
		<section className="flex flex-col items-center text-center gap-12">

			<div className="space-y-6">

				<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
					{t("title")}
				</h1>

				<p className="text-white/60 max-w-md mx-auto text-lg">
					{t("home.hero.texte")}
				</p>

			</div>

			{/* REGISTER */}
			<Button
				onClick={openSignup}
				className="px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95">
				{t("home.buttons.register")}
			</Button>

			{/* LOGIN */}
			<Button
				onClick={openLogin}
				className="px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95">
				{t("home.buttons.login")}
			</Button>

			{/* START GAME */}
			<Link to="/game">
				<Button className="px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95">
					{t("home.buttons.start")}
				</Button>
			</Link>

			{/* MODAL */}
			<SignupModal
				isOpen={activeModal === "signup"}
				onClose={closeModals}/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">

				<Link to="/" className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 backdrop-blur hover:scale-105 transition group">
					<h3 className="font-bold text-lg mb-2 group-hover:text-cyan-300 transition">{t("home.cards.home.title")}</h3>
					<p className="text-white/70 text-sm">{t("home.cards.home.description")}</p>
				</Link>

				<Link to="/game" className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 backdrop-blur hover:scale-105 transition group">
					<h3 className="font-bold text-lg mb-2 group-hover:text-cyan-300 transition">{t("home.cards.game.title")}</h3>
					<p className="text-white/70 text-sm">{t("home.cards.game.description")}</p>
				</Link>

				<Link to="/profile" className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 backdrop-blur hover:scale-105 transition group">
					<h3 className="font-bold text-lg mb-2 group-hover:text-cyan-300 transition">{t("home.cards.profile.title")}</h3>
					<p className="text-white/70 text-sm">{t("home.cards.profile.description")}</p>
				</Link>

				<LoginModal 
					isOpen={activeModal === "login"}
					onClose={closeModals}/>
			</div>
		</section>
	)
}