import { useState } from "react"
import Square from "./Square"

const combin = [
	[0, 1, 2], [3, 4, 5], [6, 7, 8],
	[0, 3, 6], [1, 4, 7], [2, 5, 8],
	[0, 4, 8], [2, 4, 6]
]

type Player = {
	id: number;
	nickname: string;
	avatar: string;
};

type BoardProps = {
	players: { X: Player; O: Player };
};

export default function Board({ players }: BoardProps) {
	const [isXturn, setRole] = useState(false)
	const [grid, setGrid] = useState(Array(9).fill(""))
	const [queue, setQueue] = useState([-1, -1, -1, -1, -1, -1])
	const [idx, setIdx] = useState(0)
	const [history, setHistory] = useState<number[]>([])



	const [showPopup, setShowPopup] = useState(false)
	const [winner, setWinner] = useState<string | null>(null)
	const [scores, setScore] = useState({ x: 0, o: 0, d: 0 })

	function handleCheckWin(copyGrid: string[]) {

		for (let i = 0; i < combin.length; i++) {
			const [a, b, c] = combin[i]
			if (copyGrid[a] && copyGrid[a] === copyGrid[b] && copyGrid[a] === copyGrid[c]) {
				setWinner(copyGrid[a])
				if (copyGrid[a] === "X") setScore(s => ({ ...s, x: s.x + 1 }))
				else setScore(s => ({ ...s, o: s.o + 1 }))
				setShowPopup(true)
				setQueue(Array(6).fill(-1))
				setIdx(0)
				setHistory([]) // send to backend befor reset ?
				return
			}
		}
		
	}

	function handleSquareClicked(move: number) {
		if (showPopup || grid[move] !== "") return
		
		const copyGrid = [...grid]
		const copyQueue = [...queue]
		const currentIdx = idx

		if (currentIdx >= 6) {
			const oldMoveIdx = copyQueue[currentIdx % 6]
			copyGrid[oldMoveIdx] = ""
		}

		copyGrid[move] = isXturn ? 'O' : 'X'
		copyQueue[currentIdx % 6] = move
		
		const nextIdx = currentIdx + 1
		setGrid(copyGrid)
		setQueue(copyQueue)
		setIdx(nextIdx)
		setRole(!isXturn)

		handleCheckWin(copyGrid)
		setHistory([...history, move])
	}

	const handleReset = () => {
		setGrid(Array(9).fill(""))
		setShowPopup(false)
		setRole(false)
		setWinner(null)
		setScore({ x: 0, o: 0, d: 0 })
		setQueue(Array(6).fill(-1))
		setIdx(0)
		setHistory([])
	}

	const handleReplay = () => {
		setGrid(Array(9).fill(""))
		setShowPopup(false)
		setRole(false)
		setWinner(null)
		setQueue(Array(6).fill(-1))
		setIdx(0)
		// 
		setHistory([]) // maybe send to backend befor reset ?
		// or setHistory([... history,-1]) to more games ???
	}

	
	console.log(queue)
	console.log(idx)
	console.log(history)

	return (
		<div className="relative inline-block text-center p-4">
			<div className={`mb-6 py-2 rounded-lg text-xl font-bold shadow-md ${!isXturn ? "bg-cyan-500 text-white" : "bg-fuchsia-500 text-white"
				}`}>
				{isXturn ? `${players.O.nickname}'s Turn O` : `${players.X.nickname}'s Turn X`}
			</div>

			<div className="grid grid-cols-3 gap-4 mb-8 text-white">
				<div className="bg-gray-800 p-4 rounded flex flex-col items-center">
					{players.X.avatar ? (
						<img src={players.X.avatar} className="w-12 h-12 rounded-full mb-2" alt="p1" />
					) : (
						<div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
							{players.X.nickname[0]}
						</div>
					)}
					<p className="font-bold">{players.X.nickname}</p>
					<p className="text-xl">{scores.x}</p>
				</div>

				<div className="bg-gray-700 p-4 rounded flex flex-col items-center justify-center">
					<p className="text-sm">Nuls</p>
					<p className="text-xl font-bold">{scores.d}</p>
				</div>

				<div className="bg-gray-800 p-4 rounded flex flex-col items-center">
					{players.O.avatar ? (
						<img src={players.O.avatar} className="w-12 h-12 rounded-full mb-2" alt="p2" />
					) : (
						<div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
							{players.O.nickname[0]}
						</div>
					)}
					<p className="font-bold">{players.O.nickname}</p>
					<p className="text-xl">{scores.o}</p>
				</div>
			</div>

			{
				showPopup && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-xl z-40">
						<div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
							<h2 className={`text-2xl font-bold mb-4 ${winner === "X" ? "text-cyan-500" : winner === "O" ? "text-fuchsia-500" : "text-gray-700"
								}`}>
								{winner === "Draw"
									? "🤝 DRAW!"
									: `🎉 ${players[winner as 'X' | 'O'].nickname} WINS!`}
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
				{grid.map((value, i) => (
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
