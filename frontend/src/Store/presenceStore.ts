import { create } from "zustand";
import type { FriendStatus } from "@/services/friendsService";

type FriendStatusByUserId = Record<number, FriendStatus>;

interface PresenceState {
	friendStatus: FriendStatusByUserId;
	setFriendStatus: (statuses: FriendStatus[]) => void;
	updateFriendStatus: (status: FriendStatus) => void;
	clearFriendStatus: () => void;
	mergeFriendStatus: (statuses: FriendStatus[]) => void;
}

/**
 * Converts friend status arrays into a lookup object keyed by user ID.
 *
 * @param statuses - Friend status list returned by the backend.
 * @returns Friend status lookup by user ID.
 */
function createFriendStatusMap(statuses: FriendStatus[]): FriendStatusByUserId {
	return Object.fromEntries(
		statuses.map((status) => [status.userId, status]),
	);
}

export const usePresenceStore = create<PresenceState>((set) => ({
	friendStatus: {},

	/**
	 * Replaces the current friend status map.
	 *
	 * @param statuses - Full friend status list.
	 * @returns Nothing.
	 */
	setFriendStatus: (statuses) =>
		set({
			friendStatus: createFriendStatusMap(statuses),
		}),

	/**
	 * Updates one friend's realtime status.
	 *
	 * @param status - Status update received from the presence socket.
	 * @returns Nothing.
	 */
	updateFriendStatus: (status) =>
		set((state) => ({
			friendStatus: {
				...state.friendStatus,
				[status.userId]: status,
			},
		})),

	/**
	 * Clears all presence state.
	 *
	 * @returns Nothing.
	 * @remarks Used on logout so stale friend status is not shown to the next user.
	 */
	clearFriendStatus: () =>
		set({
			friendStatus: {},
		}),

	/**
	 * Merges a partial status list into the current status map.
	 *
	 * @param statuses - Partial friend status list.
	 * @returns Nothing.
	 */
	mergeFriendStatus: (statuses) =>
		set((state) => ({
			friendStatus: {
				...state.friendStatus,
				...createFriendStatusMap(statuses),
			},
		})),
}));
