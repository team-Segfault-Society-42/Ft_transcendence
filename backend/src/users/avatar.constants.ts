/**
 * Maximum allowed avatar upload size in bytes.
 *
 * @remarks 200 KB helps prevent abuse and oversized base64 database storage.
 */
export const AVATAR_MAX_FILE_SIZE = 200 * 1024;

/**
 * Allowed avatar MIME types after server-side file signature detection.
 *
 * @remarks Validation uses file-type buffer inspection, not only client MIME headers.
 */
export const AVATAR_ALLOWED_MIME_TYPES = [
	'image/png',
	'image/jpeg',
	'image/webp',
] as const;

/**
 * Sliding window duration used for avatar upload rate limiting.
 */
export const AVATAR_UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Maximum avatar upload attempts allowed during the rate limit window.
 *
 * @remarks Prevents spam uploads and repeated storage abuse attempts.
 */
export const AVATAR_UPLOAD_RATE_LIMIT_MAX_REQUESTS = 10;
