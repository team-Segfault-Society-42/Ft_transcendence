import Square from "./Square"
import { useGameStore } from "../Store/gameStore";

type Player = {
	id: number;
	nickname: string;
	avatar: string;
};

type BoardProps = {
	players: { X: Player; O: Player };
};



export default function Board({ players }: BoardProps) {

	const {
		isXturn,
		grid,
		queue,
		idx,
		history,
		showPopup,
		winner,
		scores,
		resetSession,
		replayGame,
		playMove
		} = useGameStore()

	const toDisapear = idx > 5 ? queue[idx % 6] : -1



	

	
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
								onClick={replayGame}
							>
								REPLAY
							</button>
						</div>
					</div>
				)
			}
			<div className="grid grid-cols-3 gap-3">
				{grid.map((value, i) => (
					<Square key={i} value={value} onSquareClick={() => playMove(i)} isWarning={i === toDisapear}/>
				))}
			</div>

			<p className="mt-6 text-white/60 font-medium italic">2 players mode</p>
			<button
				className="mt-12 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-10 py-2 rounded-lg font-bold transition-all"
				onClick={resetSession}
			>
				RESET SESSION
			</button>
		</div >
	)
}
