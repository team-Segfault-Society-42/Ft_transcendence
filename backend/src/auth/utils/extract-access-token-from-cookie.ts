/**
 * @description Extracts the access_token value from a raw Cookie header.
 * @param rawCookies - Raw Cookie header from a WebSocket handshake.
 * @returns Decoded access_token value when present.
 * @remarks Used for WebSocket auth because Socket.IO handshakes do not use Express cookie parsing.
 */
export function extractAccessTokenFromCookie(
	rawCookies: string | undefined,
): string | undefined {
	if (!rawCookies) {
		return undefined;
	}

	for (const cookie of rawCookies.split(';')) {
		const [key, ...valueParts] = cookie.trim().split('=');
		const value = valueParts.join('=');

		if (key === 'access_token' && value) {
			try {
				return decodeURIComponent(value);
			} catch {
				return undefined;
			}
		}
	}

	return undefined;
}
