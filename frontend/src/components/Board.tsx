import Square from "./Square"



export default function Board() {
	function handleSquareClicked(index: Number) {
		alert(`Square ${index} clicked`)
	}
	return <div className="mt-8 grid grid-cols-3 gap-5">
		<Square value="" onSquareClick={() => handleSquareClicked(0)} />
		<Square value="" onSquareClick={() => handleSquareClicked(1)} />
		<Square value="" onSquareClick={() => handleSquareClicked(2)} />
		<Square value="" onSquareClick={() => handleSquareClicked(3)} />
		<Square value="" onSquareClick={() => handleSquareClicked(4)} />
		<Square value="" onSquareClick={() => handleSquareClicked(5)} />
		<Square value="" onSquareClick={() => handleSquareClicked(6)} />
		<Square value="" onSquareClick={() => handleSquareClicked(7)} />
		<Square value="" onSquareClick={() => handleSquareClicked(8)} />


	</div>
}
