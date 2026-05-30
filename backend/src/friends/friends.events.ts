/**
 * Realtime event names emitted when the friendship state changes.
 *
 * @remarks Keep these values stable because frontend socket listeners depend on them.
 */
export const FRIEND_EVENTS = {
	REQUEST_SENT: 'friend_request_sent',
	REQUEST_RECEIVED: 'friend_request_received',
	REQUEST_ACCEPTED: 'friend_request_accepted',
	REQUEST_DECLINED: 'friend_request_declined',
	FRIEND_REMOVED: 'friend_removed',
} as const;

export type FriendEventName =
	(typeof FRIEND_EVENTS)[keyof typeof FRIEND_EVENTS];
