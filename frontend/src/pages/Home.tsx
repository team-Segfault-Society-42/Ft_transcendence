import { Link } from 'react-router-dom'
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle, CardDescription } from "@/components/ui/Card"

export default function Home() {

	const { t } = useTranslation()

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
			{/* START GAME */}
			<Link to="/game">
				<Button 
					variant="primary"
					size="xl">
					{t("home.buttons.start")}
				</Button>
			</Link>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">
				<Link to="/">
  					<Card>
    					<CardTitle>
      						{t("home.cards.home.title")}
    					</CardTitle>
    					<CardDescription>
      						{t("home.cards.home.description")}
    					</CardDescription>
					</Card>
				</Link>

				<Link to="/game">
  					<Card>
    					<CardTitle>
      						{t("home.cards.game.title")}
    					</CardTitle>
    					<CardDescription>
      						{t("home.cards.game.description")}
    					</CardDescription>
					</Card>
				</Link>

				<Link to="/profile">
  					<Card>
    					<CardTitle>
      						{t("home.cards.profile.title")}
    					</CardTitle>
    					<CardDescription>
      						{t("home.cards.profile.description")}
    					</CardDescription>
					</Card>
				</Link>
			</div>
			
		</section>
	)
}