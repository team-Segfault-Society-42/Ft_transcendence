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
