import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import type { PublicUser } from "@/services/friendsService";
import type { RelationshipState } from "@/pages/Friends";
import { UserRow } from "./UserRow";

type SearchResultRowProps = {
	user: PublicUser;
	state: RelationshipState;
	incomingRequestId?: number;
	onOpenProfile: () => void;
	onSendRequest: () => void;
	onAcceptRequest: (requestId: number) => void;
	onDeclineRequest: (requestId: number) => void;
};

/**
 * Displays one user search result and the correct relationship action.
 *
 * @param user - Public user found by search.
 * @param state - Current relationship state with the authenticated user.
 * @param incomingRequestId - Incoming request ID when the target already sent a request.
 * @param onOpenProfile - Opens the user's profile.
 * @param onSendRequest - Sends a friend request.
 * @param onAcceptRequest - Accepts an incoming request.
 * @param onDeclineRequest - Declines an incoming request.
 * @returns Search result row.
 */
export function SearchResultRow({
	user,
	state,
	incomingRequestId,
	onOpenProfile,
	onSendRequest,
	onAcceptRequest,
	onDeclineRequest,
}: SearchResultRowProps) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-3">
			<UserRow user={user} onClick={onOpenProfile} />

			{state === "SELF" && (
				<span className="text-sm text-white/40">
					{t("friends.states.self")}
				</span>
			)}

			{state === "FRIEND" && (
				<span className="text-sm text-green-400">
					{t("friends.states.friend")}
				</span>
			)}

			{state === "PENDING_SENT" && (
				<Button variant="secondary" disabled>
					{t("friends.states.pending")}
				</Button>
			)}

			{state === "PENDING_RECEIVED" && incomingRequestId && (
				<div className="flex gap-2">
					<Button
						size="sm"
						onClick={() => onAcceptRequest(incomingRequestId)}
					>
						{t("friends.actions.accept")}
					</Button>

					<Button
						size="sm"
						variant="secondary"
						onClick={() => onDeclineRequest(incomingRequestId)}
					>
						{t("friends.actions.decline")}
					</Button>
				</div>
			)}

			{state === "NONE" && (
				<Button size="sm" onClick={onSendRequest}>
					{t("friends.actions.add")}
				</Button>
			)}
		</div>
	);
}
