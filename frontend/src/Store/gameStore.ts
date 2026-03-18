import {create} from 'zustand'


const COMBIN = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
]


interface GameState {
	isXturn: boolean
	grid: string[]
	queue: number[]
	idx: number
	history: number[]
	showPopup: boolean
	winner: string | null
	scores: {x: number, o: number, d:number}

	


	// functions
	resetSession: () => void
	replayGame: () => void
	playMove: (moveIdx: number) => void
}

export const useGameStore = create<GameState>((set) => ({
	isXturn: false,
	grid: Array(9).fill(""),
	queue: [-1, -1, -1, -1, -1, -1],
	idx: 0,
	history: [],
	showPopup: false,
	winner: null,
	scores: { x: 0, o: 0, d: 0 },

	resetSession: () => set({
		isXturn: false,
		grid: Array(9).fill(""),
		queue: [-1, -1, -1, -1, -1, -1],
		idx: 0,
		history: [],
		showPopup: false,
		winner: null,
		scores: { x: 0, o: 0, d: 0 },
	}),

	replayGame: () => set({
		grid: Array(9).fill(""),
		showPopup: false,
		isXturn: false,
		winner: null,
		queue: [-1, -1, -1, -1, -1, -1],
		idx: 0,
		history: []
	}),

	playMove: (moveIdx) => set((state) => {
		if(state.showPopup || state.grid[moveIdx] !== "") return {}

		const nextGrid = [...state.grid]
		const nextQueue = [...state.queue]
		const nextScores = {...state.scores}
		let nextWinner = null
		let shouldShowPopup = false

		if (state.idx >= 6) {
			const oldMoveIdx = nextQueue[state.idx % 6]
			nextGrid[oldMoveIdx] = ""
		}
		const symbol = state.isXturn ? 'O': 'X'
		nextGrid[moveIdx] = symbol;
    	nextQueue[state.idx % 6] = moveIdx;

		for (let i = 0; i < COMBIN.length; i++) {
			const [a, b, c] = COMBIN[i]
			if (nextGrid[a] && nextGrid[a] === nextGrid[b] && nextGrid[a] === nextGrid[c]) {
				nextWinner = symbol
				shouldShowPopup = true

				if (symbol === "X") nextScores.x += 1
				else nextScores.o += 1
				break
			}
		}

		return {
			isXturn: !state.isXturn,
			grid: nextGrid,
			queue: nextQueue,
			idx: state.idx + 1,
			history: [...state.history, moveIdx],
			showPopup: shouldShowPopup,
			winner: nextWinner,
			scores: nextScores
		}
	})
}))