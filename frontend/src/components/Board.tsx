import { useState } from "react"
import Square from "./Square"
import { Link } from 'react-router-dom'

const lines = [
	[0, 1, 2], [3, 4, 5], [6, 7, 8],
	[0, 3, 6], [1, 4, 7], [2, 5, 8],
	[0, 4, 8], [2, 4, 6]
]

export default function Board() {
	const [isXturn, setRole] = useState(false)
	const [state, setState] = useState(Array(9).fill(""))
	const [showPopup, setShowPopup] = useState(false)
	const [winner, setWinner] = useState<string | null>(null)
	const [scores, setScore] = useState({ x: 0, o: 0, d: 0 })

	function handleCheckWin(cState: string[]) {

		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i]
			if (cState[a] && cState[a] === cState[b] && cState[a] === cState[c]) {
				setWinner(cState[a])
				if (cState[a] === "X") setScore(s => ({ ...s, x: s.x + 1 }))
				else setScore(s => ({ ...s, o: s.o + 1 }))
				setShowPopup(true)
				return
			}
		}
		if (cState.every(cell => cell !== "")) {
			setWinner("Draw")
			setScore(s => ({ ...s, d: s.d + 1 }))
			setShowPopup(true)
		}
	}

	function handleSquareClicked(index: number) {
		if (showPopup || state[index] !== "") return
		const copy = [...state]
		copy[index] = isXturn ? 'O' : 'X'
		setState(copy)
		setRole(!isXturn)
		handleCheckWin(copy)
	}

	const handleReset = () => {
		setState(Array(9).fill(""))
		setShowPopup(false)
		setRole(false)
		setWinner(null)
		setScore({ x: 0, o: 0, d: 0 })
	}

	const handleReplay = () => {
		setState(Array(9).fill(""))
		setShowPopup(false)
		setRole(false)
		setWinner(null)
	}

	return (
		<div className="relative inline-block text-center p-4">
			<Link
				to="/"
				className="fixed top-6 left-6 text-white/40 hover:text-white hover:scale-110 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] z-50"
			>
				<span className="text-lg">←</span> Home
			</Link>
			<div className={`mb-6 py-2 rounded-lg text-xl font-bold shadow-md ${!isXturn ? "bg-cyan-500 text-white" : "bg-fuchsia-500 text-white"
				}`}>
				{isXturn ? "Player O's Turn" : "Player X's Turn"}
			</div>

			<div className="grid grid-cols-3 gap-2 mb-8 text-white">
				<div className="bg-white/20 p-2 rounded-lg border border-white/10">
					<p className="text-xs uppercase font-bold">X</p>
					<p className="text-xl font-bold">{scores.x}</p>
				</div>
				<div className="bg-white/10 p-2 rounded-lg">
					<p className="text-xs uppercase font-bold">Draw</p>
					<p className="text-xl font-bold">{scores.d}</p>
				</div>
				<div className="bg-white/20 p-2 rounded-lg border border-white/10">
					<p className="text-xs uppercase font-bold">O</p>
					<p className="text-xl font-bold">{scores.o}</p>
				</div>
			</div>

			{
				showPopup && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-40">
						<div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
							<h2 className={`text-2xl font-bold mb-4 ${winner === "X" ? "text-cyan-500" : winner === "O" ? "text-fuchsia-500" : "text-gray-700"
								}`}>
								{winner === "Draw" ? "🤝 DRAW!" : `🎉 ${winner} WINS!`}
							</h2>
							<button
								className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
								onClick={handleReplay}
							>
								REPLAY
							</button>
						</div>
					</div>
				)
			}
			<div className="grid grid-cols-3 gap-3">
				{state.map((value, i) => (
					<Square key={i} value={value} onSquareClick={() => handleSquareClicked(i)} />
				))}
			</div>

			<p className="mt-6 text-white/60 font-medium italic">2 players mode</p>
			<button
				className="mt-12 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-10 py-2 rounded-lg font-bold transition-all"
				onClick={handleReset}
			>
				RESET SESSION
			</button>
		</div >
	)
}