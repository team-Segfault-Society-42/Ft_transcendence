import { api } from "@/services/api";

export interface PublicUser {
	id: number;
	username: string;
	bio: string | null;
	avatar: string;
	wins: number;
	losses: number;
	draws: number;
	xp: number;
}

export interface FriendListItem {
	friendshipId: number;
	friend: PublicUser;
	createdAt: string;
}

export interface IncomingFriendRequest {
	requestId: number;
	sender: PublicUser;
	createdAt: string;
}

export interface OutgoingFriendRequest {
	requestId: number;
	receiver: PublicUser;
	createdAt: string;
}

export interface FriendRequestResponse {
	requestId: number;
	status: "PENDING";
	createdAt: string;
}

export interface FriendAcceptResponse {
	friendshipId: number;
	status: "ACCEPTED";
	updatedAt: string;
}

export type FriendActivity = "offline" | "available" | "waiting" | "playing";

export interface FriendStatus {
	userId: number;
	online: boolean;
	inGame: boolean;
	activity: FriendActivity;
}

/**
 * Loads realtime status summaries for accepted friends.
 *
 * @returns Friend presence and game activity statuses.
 */
async function getFriendsStatus(): Promise<FriendStatus[]> {
	const response = await api.get<FriendStatus[]>("friends/status");
	return response.data;
}

/**
 * Loads accepted friends.
 *
 * @returns Accepted friend list.
 */
async function getFriends(): Promise<FriendListItem[]> {
	const response = await api.get<FriendListItem[]>("friends");
	return response.data;
}

/**
 * Loads pending incoming friend requests.
 *
 * @returns Incoming request list.
 */
async function getIncomingFriendRequests(): Promise<IncomingFriendRequest[]> {
	const response = await api.get<IncomingFriendRequest[]>(
		"friends/requests/incoming",
	);

	return response.data;
}

/**
 * Loads pending outgoing friend requests.
 *
 * @returns Outgoing request list.
 */
async function getOutgoingFriendRequests(): Promise<OutgoingFriendRequest[]> {
	const response = await api.get<OutgoingFriendRequest[]>(
		"friends/requests/outgoing",
	);

	return response.data;
}

/**
 * Searches public users by username.
 *
 * @param query - Username search text.
 * @param limit - Maximum number of users to return.
 * @param offset - Number of users to skip before returning results.
 * @returns Matching public users.
 */
async function searchUsers(
	query: string,
	limit = 10,
	offset = 0,
): Promise<PublicUser[]> {
	const response = await api.get<PublicUser[]>("users", {
		params: {
			search: query,
			limit,
			offset,
		},
	});

	return response.data;
}

/**
 * Sends a friend request.
 *
 * @param userId - Target user ID.
 * @returns Created request summary.
 */
async function sendFriendRequest(
	userId: number,
): Promise<FriendRequestResponse> {
	const response = await api.post<FriendRequestResponse>(
		`friends/requests/${userId}`,
	);

	return response.data;
}

/**
 * Accepts an incoming friend request.
 *
 * @param requestId - Friend request ID.
 * @returns Accepted friendship summary.
 */
async function acceptFriendRequest(
	requestId: number,
): Promise<FriendAcceptResponse> {
	const response = await api.patch<FriendAcceptResponse>(
		`friends/requests/${requestId}`,
		{
			action: "ACCEPT",
		},
	);

	return response.data;
}

/**
 * Declines an incoming friend request.
 *
 * @param requestId - Friend request ID.
 * @returns Backend message response.
 */
async function declineFriendRequest(
	requestId: number,
): Promise<{ message: string }> {
	const response = await api.patch<{ message: string }>(
		`friends/requests/${requestId}`,
		{
			action: "DECLINE",
		},
	);

	return response.data;
}

/**
 * Removes an accepted friend.
 *
 * @param friendshipId - Accepted friendship ID.
 * @returns Backend message response.
 */
async function removeFriend(
	friendshipId: number,
): Promise<{ message: string }> {
	const response = await api.delete<{ message: string }>(
		`friends/${friendshipId}`,
	);

	return response.data;
}

export const friendsService = {
	getFriends,
	getIncomingFriendRequests,
	getOutgoingFriendRequests,
	getFriendsStatus,
	sendFriendRequest,
	acceptFriendRequest,
	declineFriendRequest,
	removeFriend,
	searchUsers,
};
