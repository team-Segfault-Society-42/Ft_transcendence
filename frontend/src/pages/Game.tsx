import Board from "../components/Board"

export default function Game() {

	const players = {
		X: {
			id: 1,
			nickname: "Simo",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Simo"
		},
		O: {
			id: 2,
			nickname: "John",
			avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
		}
	}

	return <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-600 via-fuchsia-700 to-cyan-800">
		<h1 className="mt-4 text-8xl font-bold text-cyan-50">
			Game
		</h1>
		<Board players={players} />
	</main>
}