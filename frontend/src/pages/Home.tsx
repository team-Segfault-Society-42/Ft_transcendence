import { Link } from 'react-router-dom'

export default function Home() {
	return (
		<main className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
			<section className="text-center">
				<h1 className="text-5xl font-bold text-white">
					ft_transcendence
				</h1>
				<div className="mt-10">
					<Link
						to="/game"
						className="bg-cyan-500 hover:bg-cyan-400 text-white px-12 py-4 rounded-2xl font-black text-2xl shadow-lg transition-all hover:scale-110 active:scale-95 inline-block"
					>
						START GAME
					</Link>
				</div>
			</section>

		</main>
	)
}