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

	return (
		<div>

			<Board players={players} />
			
		</div>

	)
}