type SquareProps = {
	value: string
	onSquareClick: () => void
}



export default function Square({ value, onSquareClick }: SquareProps) {
	return <button className="h-32 w-32 rounded-xl border border-white bg-fuchsia-400 text-7xl font-bold text-white shadow-md"
		onClick={onSquareClick}>
		{value}
	</button>
}