import { create } from 'zustand';

import { friendsService } from "@/services/friendsService";

import type {
	FriendListItem,
	IncomingFriendRequest,
	OutgoingFriendRequest,
} from "@/services/friendsService";

interface FriendsStore {
	friends: FriendListItem[];
	incomingRequests: IncomingFriendRequest[];
	outgoingRequests: OutgoingFriendRequest[];

	isLoading: boolean;
	error: string | null;

	loadFriendsData: () => Promise<void>;
	clearFriendsData: () => void;
}

export const useFriendsStore = create<FriendsStore>((set) => ({
	friends: [],
	incomingRequests: [],
	outgoingRequests: [],

	isLoading: false,
	error: null,

	loadFriendsData: async () => {
		set({
			isLoading: true,
			error: null,
		});

		try {
			const [friends, incomingRequests, outgoingRequests] =
				await Promise.all([
					friendsService.getFriends(),
					friendsService.getIncomingFriendRequests(),
					friendsService.getOutgoingFriendRequests(),
				]);

			set({
				friends,
				incomingRequests,
				outgoingRequests,
				isLoading: false,
			});
		} catch (error: unknown) {
			console.error('Failed to load friends data:', error);

			set({
				error: 'Failed to load friends data',
				isLoading: false,
			});
		}
	},

	clearFriendsData: () => {
		set({
			friends: [],
			incomingRequests: [],
			outgoingRequests: [],
			isLoading: false,
			error: null,
		});
	},
}));
