type SquareProps = {
	value: string
}

export default function Square({ value }: SquareProps) {
	return <main>
		<button className="h-32 w-32 rounded-xl border border-white bg-fuchsia-400 text-3xl font-bold text-white shadow-md">
			{value}
		</button>
	</main>
}