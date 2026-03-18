import {create} from 'zustand'

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
	})
}))