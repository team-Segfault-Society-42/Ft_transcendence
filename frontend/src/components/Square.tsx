type SquareProps = {
	value: string
}

export default function Square({ value }: SquareProps) {
	return <button className="h-32 w-32 rounded-xl border border-white/30 bg-white/50 text-3xl font-bold text-white shadow-md">
		{value}
	</button>
}