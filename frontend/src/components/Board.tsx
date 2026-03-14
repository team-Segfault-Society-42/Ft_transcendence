import Square from "./Square"

export default function Board() {
	return <div className="mt-8 grid grid-cols-3 gap-5">
		<Square value="1" />
		<Square value="2" />
		<Square value="3" />
		<Square value="4" />
		<Square value="5" />
		<Square value="6" />
		<Square value="7" />
		<Square value="8" />
		<Square value="9" />

	</div>
}
