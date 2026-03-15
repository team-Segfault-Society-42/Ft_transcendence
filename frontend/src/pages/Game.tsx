import Board from "../components/Board"

export default function Game() {
	return <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-600 via-fuchsia-700 to-cyan-800">
		<h1 className="mt-4 text-8xl font-bold text-cyan-50">
			Game
		</h1>
		<Board />
	</main>
}