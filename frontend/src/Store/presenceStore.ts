import { create } from "zustand";
import type { FriendStatus } from "@/services/friendsService";

interface PresenceState {
	friendStatus: Record<number, FriendStatus>;

	setFriendStatus: (statuses: FriendStatus[]) => void;

	updateFriendStatus: (status: FriendStatus) => void;

	clearFriendStatus: () => void;

	mergeFriendStatus: (statuses: FriendStatus[]) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
	friendStatus: {},

	setFriendStatus: (statuses) =>
		set({
			friendStatus: Object.fromEntries(
				statuses.map((status) => [status.userId, status]),
			),
		}),

	updateFriendStatus: (status) =>
		set((state) => ({
			friendStatus: {
				...state.friendStatus,
				[status.userId]: status,
			},
		})),

	clearFriendStatus: () =>
		set({
			friendStatus: {},
		}),

	mergeFriendStatus: (statuses) =>
	set((state) => ({
		friendStatus: {
			...state.friendStatus,
			...Object.fromEntries(
				statuses.map((status) => [status.userId, status]),
			),
		},
	})),
}));
