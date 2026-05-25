/**
 * Maximum number of pending outgoing friend requests allowed per user.
 *
 * @remarks This prevents simple request-spam abuse.
 */
export const MAX_PENDING_FRIEND_REQUESTS = 50;

/**
 * Maximum number of friend-related rows returned by list endpoints.
 *
 * @remarks Keeps friends endpoints bounded and avoids accidentally returning very large lists.
 */
export const MAX_FRIEND_RESULTS = 100;
