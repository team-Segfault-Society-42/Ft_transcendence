export const AVATAR_MAX_FILE_SIZE = 200 * 1024;

export const AVATAR_ALLOWED_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
] as const;

export const AVATAR_UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const AVATAR_UPLOAD_RATE_LIMIT_MAX_REQUESTS = 10;
