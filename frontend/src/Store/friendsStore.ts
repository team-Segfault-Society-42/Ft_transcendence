import { create } from "zustand";
import { friendsService } from "@/services/friendsService";
import type {
	FriendListItem,
	IncomingFriendRequest,
	OutgoingFriendRequest,
} from "@/services/friendsService";

interface FriendsStoreState {
	friends: FriendListItem[];
	incomingRequests: IncomingFriendRequest[];
	outgoingRequests: OutgoingFriendRequest[];
	isLoading: boolean;
	error: string | null;
}

interface FriendsStore extends FriendsStoreState {
	loadFriendsData: () => Promise<void>;
	clearFriendsData: () => void;
}

const emptyFriendsState: FriendsStoreState = {
	friends: [],
	incomingRequests: [],
	outgoingRequests: [],
	isLoading: false,
	error: null,
};

/**
 * Loads all friend-related lists needed by the Friends page and realtime updates.
 *
 * @returns Friends, incoming requests, and outgoing requests.
 */
async function loadAllFriendLists(): Promise<
	Pick<FriendsStoreState, "friends" | "incomingRequests" | "outgoingRequests">
> {
	const [friends, incomingRequests, outgoingRequests] = await Promise.all([
		friendsService.getFriends(),
		friendsService.getIncomingFriendRequests(),
		friendsService.getOutgoingFriendRequests(),
	]);

	return {
		friends,
		incomingRequests,
		outgoingRequests,
	};
}

export const useFriendsStore = create<FriendsStore>((set) => ({
	...emptyFriendsState,

	/**
	 * Loads accepted friends plus incoming and outgoing requests.
	 *
	 * @returns Nothing. Updates the Zustand store.
	 */
		loadFriendsData: async () => {
		set({
			isLoading: true,
			error: null,
		});

		try {
			const friendsData = await loadAllFriendLists();

			set({
				...friendsData,
				isLoading: false,
			});
		} catch (error: unknown) {
			if (import.meta.env.DEV) {
				console.warn("[Friends] failed to load friends data:", error);
			}

			set({
				error: "Failed to load friends data",
				isLoading: false,
			});
		}
	},

	/**
	 * Clears all friend-related frontend state.
	 *
	 * @returns Nothing.
	 * @remarks Used after logout so stale friend data is not shown to the next user.
	 */
	clearFriendsData: () => {
		set(emptyFriendsState);
	},
}));
