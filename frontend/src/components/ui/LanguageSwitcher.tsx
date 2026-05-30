import { useTranslation } from "react-i18next"

const languages = [
	{ code: "en", label: "EN", flag: "🇬🇧" },
	{ code: "fr", label: "FR", flag: "🇫🇷" },
	{ code: "es", label: "ES", flag: "🇪🇸" },
  ]

/**
 * Displays the application language switcher.
 *
 * Allows users to:
 * - change the application language
 * - persist the selected language in localStorage
 *
 * Supports:
 * - English
 * - French
 * - Spanish
 */
export default function LanguageSwitcher() {
	const { i18n } = useTranslation()

	/**
	 * Changes the current application language
	 * and stores it in localStorage.
	 *
	 * @param lang - Selected language code.
	 */
	const changeLang = (lang: string) => {
		i18n.changeLanguage(lang)
		localStorage.setItem("lang", lang)
	}

	return (
		<div className="flex gap-2 text-lg font-bold uppercase">

			{/* LANGUAGE BUTTONS */}
			{languages.map((lang) => (
				<button
					key={lang.code}
					onClick={() => changeLang(lang.code)}
					className={`px-2 py-1 rounded transition ${
						i18n.language === lang.code
							? "text-cyan-400 hover:scale-110 active:scale-95"
							: "text-white/40 hover:text-white hover:scale-110 active:scale-95"
					}`}>

					{/* LANGUAGE FLAG */}
					<span>
						{lang.flag}
					</span>

					{/* LANGUAGE LABEL */}
					<span className="font-bold">
						{lang.label}
					</span>
				</button>
			))}
		</div>
	)
}