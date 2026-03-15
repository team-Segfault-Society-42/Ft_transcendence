import { useState } from "react"
import Square from "./Square"

export default function Board() {

	const [isXturn, setRole] = useState(false)
	const [state, setState] = useState(Array(9).fill(""))
	const [showPopup, setShowPopup] = useState(false)
	const [winner, setWinner] = useState<string | null>(null)

	function handleCheckWin(cState: string[]) {
		const lines = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8],
			[0, 3, 6], [1, 4, 7], [2, 5, 8],
			[0, 4, 8], [2, 4, 6]
		]

		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i]
			if (cState[a] && cState[a] === cState[b] && cState[a] == cState[c]) {
				setWinner(cState[a])
				setShowPopup(true)
				return
			}
		}
		if (cState.every(cell => cell !== "")) {
			setWinner("Draw")
			setShowPopup(true)
		}
	}

	function handleSquareClicked(index: number) {
		if (showPopup) return;

		const copy: string[] = Array.from(state)

		if (copy[index] === "") {
			if (!isXturn) {
				copy[index] = 'X'
				setRole(!isXturn)
			}
			else {
				copy[index] = 'O'
				setRole(!isXturn)
			}
			setState(copy)
			handleCheckWin(copy)
		}
	}

	function handleReset() {
		setState(Array(9).fill(""))
		setShowPopup(false)
		setRole(false)
		setWinner(null)
	}

	return <div className="relative inline-block text-center">
		<div className="mt-4 text-2xl font-bold text-white bg-fuchsia-500/20 py-2 rounded-lg">
			{!isXturn ? "Tour de : X" : "Tour de : O"}
		</div>
		{showPopup && (
			<div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl z-40">
				<div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
					<h2 className="text-2xl font-bold text-fuchsia-500 mb-2">
						{winner === "Draw" ? "🤝 It's a Draw !" : `🎉 Player ${winner} Youuuu wiiiin !`}
					</h2>
					<button
						className="rounded-xl bg-fuchsia-400 px-6 py-2 text-2xl font-bold text-white shadow-md hover:bg-fuchsia-500"
						onClick={handleReset}>
						Rejouer
					</button>
				</div>
			</div>
		)}

		<div className="mt-4 grid grid-cols-3 gap-3">
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

		<div className="mt-20 flex justify-center">
			<button className="rounded-xl border border-white bg-fuchsia-400 p-3 text-4xl font-bold text-white shadow-md"
				onClick={handleReset}>
				Reset
			</button>
		</div>

	</div>
}