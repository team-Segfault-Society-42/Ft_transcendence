import { useState } from "react"
import Square from "./Square"

export default function Board() {

	const [isXturn, setRole] = useState(false)
	const [state, setState] = useState(Array(9).fill(""))
	const [showPopup, setShowPopup] = useState(false)
	const [winner, setWinner] = useState<string | null>(null)
	const [scores, setScore] = useState({ x: 0, o: 0, d: 0 })



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
				if (cState[a] === "X")
					setScore(s => ({ ...s, x: s.x + 1 }))
				else if (cState[a] === "O")
					setScore(s => ({ ...s, o: s.o + 1 }))
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
		if (showPopup || state[index] !== "") return;

		const copy = [...state]

		copy[index] = isXturn ? 'O' : 'X';
		setState(copy)
		setRole(!isXturn)
		handleCheckWin(copy)
	}

	function handleReset() {
		setState(Array(9).fill(""))
		setShowPopup(false)
		setRole(false)
		setWinner(null)
		setScore({ x: 0, o: 0, d: 0 })

	}

	function handleReplay() {
		setState(Array(9).fill(""))
		setShowPopup(false)
		setRole(false)
		setWinner(null)
	}

	return <div className="relative inline-block text-center">
		<div className="mt-4 mb-6 flex flex-col gap-4 w-full max-w-sm mx-auto">
			<div className={`py-2 rounded-full text-xl font-black tracking-widest transition-all duration-300 shadow-lg
				${!isXturn
					? `bg-cyan-500 text-fuchsia-500 shadow-cyan-500/50`
					: `bg-fuchsia-500 text-cyan-500 `}`}>
				{!isXturn ? "Turn of X" : "Turn of O"}
			</div>

			<div className="grid grid-cols-3">
				<div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
					<p className="text-[12px] uppercase opacity-60 font-bold"> Player X </p>
					<p className="text-2xl font-black"> {scores.x} </p>
				</div>
				<div className="bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
					<p className="text-[12px] uppercase opacity-60 font-bold"> Draw </p>
					<p className="text-2xl font-black"> {scores.d} </p>
				</div>
				<div className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/20">
					<p className="text-[12px] uppercase opacity-60 font-bold"> Player O </p>
					<p className="text-2xl font-black"> {scores.o} </p>
				</div>
			</div>
		</div>
		{
			showPopup && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-xl z-40">
					<div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
						<h2 className="text-2xl font-bold text-fuchsia-500 mb-2">
							{winner === "Draw" ? "🤝 It's a Draw !" : `🎉 Player ${winner} Youuuu wiiiin !`}
							<br />Score : Draw = {scores.d}
							<br />Score : X = {scores.x}
							<br />Score : O = {scores.o}
						</h2>
						<button
							className="rounded-xl bg-fuchsia-400 px-6 py-2 text-2xl font-bold text-white shadow-md hover:bg-fuchsia-500"
							onClick={handleReplay}>
							Replay
						</button>
					</div>
				</div>
			)
		}

		<div className="mt-4 grid grid-cols-3 gap-3">
			{state.map((value, i) => (
				<Square
					key={i}
					value={value}
					onSquareClick={() => handleSquareClicked(i)}
				/>
			))}
		</div>

		<div className="mt-4 text-2xl font-bold text-white bg-fuchsia-500/20 py-2 rounded-lg">
			2 players
		</div>

		<div className="mt-20 flex justify-center">
			<button className="rounded-xl border border-white bg-fuchsia-400 p-3 text-4xl font-bold text-white shadow-md"
				onClick={handleReset}>
				Reset
			</button>
		</div>

	</div >
}