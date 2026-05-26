import { io, type Socket } from "socket.io-client";

let presenceSocket: Socket | null = null;

/**
 * Creates or reuses the singleton presence socket.
 *
 * @returns Connected or connecting Socket.IO presence socket.
 * @remarks The backend authenticates this socket using the HttpOnly access_token cookie.
 */
export function connectPresenceSocket(): Socket {
	if (presenceSocket) {
		return presenceSocket;
	}

	presenceSocket = io(`${window.location.origin}/presence`, {
		path: "/socket.io/",
		transports: ["websocket"],
		withCredentials: true,
	});

	return presenceSocket;
}

/**
 * Disconnects and clears the singleton presence socket.
 *
 * @returns Nothing.
 */
export function disconnectPresenceSocket(): void {
	if (!presenceSocket) {
		return;
	}

	presenceSocket.disconnect();
	presenceSocket = null;
}
