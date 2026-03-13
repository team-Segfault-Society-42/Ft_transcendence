import Board from "../components/Board"

export default function game() {
	return <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
		<h1 className="text-4xl font-bold text-amber-300">
			Game page
		</h1>

		<p className="mt-10 text-amber-50">
			Board coming soon
		</p>
		<Board />
	</main>
}