import { useTranslation } from "react-i18next"

export default function LanguageSwitcher() {
	const { i18n } = useTranslation()

	const changeLang = (lang: string) => {
		i18n.changeLanguage(lang)
		localStorage.setItem("lang", lang)
	}

	return (
		<div className="flex gap-2 text-sm font-bold uppercase">
			{["en", "fr", "es"].map((lang) => (
				<button
					key={lang}
					onClick={() => changeLang(lang)}
					className={`px-2 py-1 rounded transition ${
						i18n.language === lang
							? "text-cyan-400"
							: "text-white/40 hover:text-white"
					}`}
				>
					{lang.toUpperCase()}
				</button>
			))}
		</div>
	)
}