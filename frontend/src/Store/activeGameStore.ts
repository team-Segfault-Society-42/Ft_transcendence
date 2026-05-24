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

export const useActiveGameStore = create<ActiveGameStore>((set) => ({
	activeGame: null,
	loading: false,

	setActiveGame: (game) =>
		set({
			activeGame: game,
		}),

	clearActiveGame: () =>
		set({
			activeGame: null,
		}),
    
        fetchActiveGame: async () => {
            try {
                set({ loading: true });
        
                const data = await gameApi.getActiveGame();
        

                set({
                    activeGame: data,
                    loading: false,
                });
            }
            catch (error: unknown) {
                console.error("Failed to fetch active game:", error);
        
                set({
                    activeGame: null,
                    loading: false,
                });
            }
        },
}));