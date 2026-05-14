import { io, type Socket } from "socket.io-client";

let presenceSocket: Socket | null = null;

export function connectPresenceSocket(): Socket {
	if (presenceSocket) {
		return presenceSocket;
	}

	presenceSocket = io(window.location.origin, {
		path: "/socket.io/",
		transports: ["websocket"],
		withCredentials: true,
	});

	return presenceSocket;
}

export function disconnectPresenceSocket(): void {
	if (!presenceSocket) {
		return;
	}

	presenceSocket.disconnect();
	presenceSocket = null;
}
