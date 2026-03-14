import { useState } from "react"
import Square from "./Square"



export default function Board() {

	const [role, setRole] = useState(false)
	const [state, setState] = useState(["", "", "", "", "", "", "", "", ""])

	function handleSquareClicked(index: number) {

		const copy: string[] = Array.from(state)
		if (copy[index] === "") {
			if (!role) {
				copy[index] = 'X'
				setRole(!role)
			}
			else {
				copy[index] = 'O'
				setRole(!role)
			}
			setState(copy)
		}
	}



	return <div className="mt-8 grid grid-cols-3 gap-5">
		<Square value={state[0]} onSquareClick={() => handleSquareClicked(0)} />
		<Square value={state[1]} onSquareClick={() => handleSquareClicked(1)} />
		<Square value={state[2]} onSquareClick={() => handleSquareClicked(2)} />
		<Square value={state[3]} onSquareClick={() => handleSquareClicked(3)} />
		<Square value={state[4]} onSquareClick={() => handleSquareClicked(4)} />
		<Square value={state[5]} onSquareClick={() => handleSquareClicked(5)} />
		<Square value={state[6]} onSquareClick={() => handleSquareClicked(6)} />
		<Square value={state[7]} onSquareClick={() => handleSquareClicked(7)} />
		<Square value={state[8]} onSquareClick={() => handleSquareClicked(8)} />


	</div>
}
