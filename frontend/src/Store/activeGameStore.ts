import { create } from "zustand";
import { gameApi } from "@/services/gameApi";

type ActiveGameStatus = "idle" | "waiting" | "playing";

interface ActiveGame {
	gameId: string;
	status: ActiveGameStatus;

	playerX?: {
		username: string;
		avatar?: string;
	};

	playerO?: {
		username: string;
		avatar?: string;
	};
}

type ActiveGameStore = {
	activeGame: ActiveGame | null;
	loading: boolean;

	setActiveGame: (game: ActiveGame | null) => void;
	clearActiveGame: () => void;
    fetchActiveGame: () => Promise<void>;
};

/**
 * Global Zustand store used to manage the user's
 * current active multiplayer game state.
 *
 * Handles:
 * - active game synchronization
 * - loading state
 * - active game cleanup
 * - active game fetching from the backend
 */
export const useActiveGameStore = create<ActiveGameStore>((set) => ({

	/* STORE STATE */
	activeGame: null,
	loading: false,

	/**
	 * Updates the current active game state.
	 *
	 * @param game - Active game data or null.
	 */
	setActiveGame: (game) =>
		set({
			activeGame: game,
		}),

	/**
	 * Clears the current active game state.
	 */
	clearActiveGame: () =>
		set({
			activeGame: null,
		}),
    
		/**
		 * Fetches the current active game from the backend.
		 *
		 * Updates:
		 * - active game state
		 * - loading state
		 *
		 * Clears the active game state if the request fails.
		 *
		 * @returns Promise resolved when the request completes.
		 */
        fetchActiveGame: async () => {
            try {
                set({ loading: true });
        
				/* ACTIVE GAME REQUEST */
                const data = await gameApi.getActiveGame();
        
				/* STORE UPDATE */
                set({
                    activeGame: data,
                    loading: false,
                });
            }
            catch (error: unknown) {
                console.error("Failed to fetch active game:", error);
        
				/* ERROR RESET */
                set({
                    activeGame: null,
                    loading: false,
                });
            }
        },
}));