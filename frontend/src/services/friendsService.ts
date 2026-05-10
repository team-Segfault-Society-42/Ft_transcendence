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

export async function getFriends(): Promise<FriendListItem[]> {
	const response = await api.get("friends");
	return response.data;
}

export async function getIncomingFriendRequests(): Promise<IncomingFriendRequest[]> {
	const response = await api.get("friends/requests/incoming");
	return response.data;
}

export async function getOutgoingFriendRequests(): Promise<OutgoingFriendRequest[]> {
	const response = await api.get("friends/requests/outgoing");
	return response.data;
}

export async function sendFriendRequest(userId: number): Promise<FriendRequestResponse> {
	const response = await api.post(`friends/requests/${userId}`);
	return response.data;
}

export async function acceptFriendRequest(
	requestId: number,
): Promise<FriendAcceptResponse> {
	const response = await api.patch(`friends/requests/${requestId}`, {
		action: "ACCEPT",
	});
	return response.data;
}

export async function declineFriendRequest(requestId: number): Promise<{ message: string }> {
	const response = await api.patch(`friends/requests/${requestId}`, {
		action: "DECLINE",
	});
	return response.data;
}

export async function removeFriend(friendshipId: number): Promise<{ message: string }> {
	const response = await api.delete(`friends/${friendshipId}`);
	return response.data;
}

export const friendsService = {
	getFriends,
	getIncomingFriendRequests,
	getOutgoingFriendRequests,
	sendFriendRequest,
	acceptFriendRequest,
	declineFriendRequest,
	removeFriend,
};
