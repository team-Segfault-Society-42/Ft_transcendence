import {
	Check,
	Inbox,
	Send,
	Trash2,
	UserPlus,
	UsersRound,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useFriendsStore } from "@/Store/friendsStore";
import { usePresenceStore } from "@/Store/presenceStore";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { Input } from "@/components/ui/Input";
import { Username } from "@/components/ui/Username";
import {
	friendsService,
	type FriendStatus,
	type PublicUser,
} from "@/services/friendsService";
import { getBackendErrorMessage } from "../utils/getBackendErrorMessage";

interface CurrentUser {
	id: number;
	username: string;
	avatar?: string;
	bio?: string;
	wins?: number;
	losses?: number;
	draws?: number;
	xp?: number;
}

export type RelationshipState =
	| "SELF"
	| "FRIEND"
	| "PENDING_SENT"
	| "PENDING_RECEIVED"
	| "NONE";

const defaultOfflineStatus = (userId: number): FriendStatus => ({
	userId,
	online: false,
	inGame: false,
	activity: "offline",
});

export default function Friends() {
	const { t } = useTranslation();
	const [user] = useOutletContext<[CurrentUser | null]>();
	const navigate = useNavigate();

	const friends = useFriendsStore((state) => state.friends);
	const incomingRequests = useFriendsStore((state) => state.incomingRequests);
	const outgoingRequests = useFriendsStore((state) => state.outgoingRequests);
	const loading = useFriendsStore((state) => state.isLoading);
	const loadFriendsData = useFriendsStore((state) => state.loadFriendsData);

	const friendStatus = usePresenceStore((state) => state.friendStatus);

	const [search, setSearch] = useState("");
	const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);

	const incomingRequestBySenderId = useMemo(() => {
		return new Map(
			incomingRequests.map((request) => [request.sender.id, request]),
		);
	}, [incomingRequests]);

	/**
	 * Displays a translated backend error toast.
	 *
	 * @param error - Unknown async error from an API call.
	 * @param translationKey - Frontend translation key wrapping the backend error.
	 * @returns Nothing.
	 */
	function showActionError(error: unknown, translationKey: string): void {
		const finalMessage = getBackendErrorMessage(error);

		toast.error(
			t(translationKey, {
				error: t(`backend.${finalMessage}`, {
					defaultValue: finalMessage,
				}),
			}),
		);
	}

	/**
	 * Calculates the relationship between the current user and a target user.
	 *
	 * @param targetUserId - User ID shown in search results.
	 * @returns Relationship state used to decide which button to show.
	 */
	function getRelationshipState(targetUserId: number): RelationshipState {
		if (user && targetUserId === user.id) {
			return "SELF";
		}

		if (friends.some((item) => item.friend.id === targetUserId)) {
			return "FRIEND";
		}

		if (outgoingRequests.some((request) => request.receiver.id === targetUserId)) {
			return "PENDING_SENT";
		}

		if (incomingRequests.some((request) => request.sender.id === targetUserId)) {
			return "PENDING_RECEIVED";
		}

		return "NONE";
	}

	/**
	 * Searches users by username.
	 *
	 * @param event - Search form submit event.
	 * @returns Nothing. Updates local search result state.
	 */
	async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const trimmedSearch = search.trim();

		if (!trimmedSearch) {
			setSearchResults([]);
			return;
		}

		try {
			setSearchLoading(true);
			setSearchResults([]);

			const results = await friendsService.searchUsers(trimmedSearch);

			setSearchResults(results);
		} catch (error: unknown) {
			showActionError(error, "friends.errors.search");
		} finally {
			setSearchLoading(false);
		}
	}

	/**
	 * Runs a friend action, shows a success toast, and refreshes friend state.
	 *
	 * @param action - Friend API action to execute.
	 * @param successKey - Translation key shown after success.
	 * @returns Nothing.
	 */
	async function runFriendAction(
		action: () => Promise<void>,
		successKey: string,
	): Promise<void> {
		try {
			await action();
			toast.success(t(successKey));
			await loadFriendsData();
		} catch (error: unknown) {
			showActionError(error, "friends.errors.action");
		}
	}

	function handleSendRequest(userId: number) {
		return runFriendAction(
			async () => {
				await friendsService.sendFriendRequest(userId);
			},
			"friends.success.requestSent",
		);
	}

	function handleAcceptRequest(requestId: number) {
		return runFriendAction(
			async () => {
				await friendsService.acceptFriendRequest(requestId);
			},
			"friends.success.accepted",
		);
	}

	function handleDeclineRequest(requestId: number) {
		return runFriendAction(
			async () => {
				await friendsService.declineFriendRequest(requestId);
			},
			"friends.success.declined",
		);
	}

	function handleRemoveFriend(friendshipId: number) {
		return runFriendAction(
			async () => {
				await friendsService.removeFriend(friendshipId);
			},
			"friends.success.removed",
		);
	}

	if (!user) {
		return (
			<section className="w-full max-w-3xl mx-auto px-6 py-10 text-white">
				<EmptyStateCard
					title={t("friends.title")}
					icon={<UsersRound size={24} />}
					message={t("friends.notConnected")}
					description={t("friends.login")}
					actions={
						<Button onClick={() => navigate("/")}>
							{t("buttons.backHome")}
						</Button>
					}
				/>
			</section>
		);
	}

	return (
		<section className="w-full max-w-5xl mx-auto px-6 py-10 text-white">
			{/* Page header */}
			<div className="mb-8 text-center">
				<h1 className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent text-3xl font-bold">
					{t("friends.title")}
				</h1>

				<p className="text-white/50 mt-2">
					{t("friends.description")}
				</p>
			</div>

			{/* User search */}
			<Card className="mb-6">
				<CardTitle className="flex items-center gap-2">
					<UserPlus size={20} />
					{t("friends.search.title")}
				</CardTitle>

				<form
					onSubmit={handleSearch}
					className="flex flex-col sm:flex-row gap-3"
				>
					<Input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder={t("friends.search.placeholder")}
					/>

					<Button type="submit" loading={searchLoading}>
						{t("friends.search.button")}
					</Button>
				</form>

				<div className="mt-4 space-y-3">
					{searchResults.map((result) => {
						const state = getRelationshipState(result.id);
						const incomingRequest = incomingRequestBySenderId.get(result.id);

						return (
							<SearchResultRow
								key={result.id}
								user={result}
								state={state}
								incomingRequestId={incomingRequest?.requestId}
								onOpenProfile={() =>
									navigate(`/profile/${result.username}`)
								}
								onSendRequest={() => handleSendRequest(result.id)}
								onAcceptRequest={(requestId) =>
									handleAcceptRequest(requestId)
								}
								onDeclineRequest={(requestId) =>
									handleDeclineRequest(requestId)
								}
							/>
						);
					})}
				</div>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Accepted friends */}
				<Card>
					<CardTitle className="flex items-center gap-2">
						<UsersRound size={20} />
						{t("friends.list.title")}
					</CardTitle>

					{loading ? (
						<p className="text-white/50">{t("friends.loading")}</p>
					) : friends.length === 0 ? (
						<p className="text-white/50">{t("friends.list.empty")}</p>
					) : (
						<div className="space-y-3">
							{friends.map((item) => {
								const status =
									friendStatus[item.friend.id] ??
									defaultOfflineStatus(item.friend.id);

								return (
									<FriendRow
										key={item.friendshipId}
										friend={item.friend}
										status={status}
										onOpenProfile={() =>
											navigate(`/profile/${item.friend.username}`)
										}
										onRemove={() =>
											handleRemoveFriend(item.friendshipId)
										}
									/>
								);
							})}
						</div>
					)}
				</Card>

				{/* Friend requests */}
				<div className="space-y-6">
					<Card>
						<CardTitle className="flex items-center gap-2">
							<Inbox size={20} />
							{t("friends.requests.incoming")}
						</CardTitle>

						{loading ? (
							<p className="text-white/50">{t("friends.loading")}</p>
						) : incomingRequests.length === 0 ? (
							<p className="text-white/50">
								{t("friends.requests.noIncoming")}
							</p>
						) : (
							<div className="space-y-3">
								{incomingRequests.map((request) => (
									<div
										key={request.requestId}
										className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
									>
										<UserRow
											user={request.sender}
											onClick={() =>
												navigate(`/profile/${request.sender.username}`)
											}
										/>

										<div className="flex gap-2 justify-center">
											<Button
												size="sm"
												onClick={() =>
													handleAcceptRequest(request.requestId)
												}
												aria-label={t("friends.actions.accept")}
												title={t("friends.actions.accept")}
												className="px-8"
											>
												<Check size={16} />
											</Button>

											<Button
												size="sm"
												variant="secondary"
												onClick={() =>
													handleDeclineRequest(request.requestId)
												}
												aria-label={t("friends.actions.decline")}
												title={t("friends.actions.decline")}
												className="px-8"
											>
												<X size={16} />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</Card>

					<Card>
						<CardTitle className="flex items-center gap-2">
							<Send size={20} />
							{t("friends.requests.outgoing")}
						</CardTitle>

						{loading ? (
							<p className="text-white/50">{t("friends.loading")}</p>
						) : outgoingRequests.length === 0 ? (
							<p className="text-white/50">
								{t("friends.requests.noOutgoing")}
							</p>
						) : (
							<div className="space-y-3">
								{outgoingRequests.map((request) => (
									<div
										key={request.requestId}
										className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-3"
									>
										<UserRow
											user={request.receiver}
											onClick={() =>
												navigate(`/profile/${request.receiver.username}`)
											}
										/>

										<span className="text-sm text-yellow-400">
											{t("friends.states.pending")}
										</span>
									</div>
								))}
							</div>
						)}
					</Card>
				</div>
			</div>
		</section>
	);
}

function SearchResultRow({
	user,
	state,
	incomingRequestId,
	onOpenProfile,
	onSendRequest,
	onAcceptRequest,
	onDeclineRequest,
}: {
	user: PublicUser;
	state: RelationshipState;
	incomingRequestId?: number;
	onOpenProfile: () => void;
	onSendRequest: () => void;
	onAcceptRequest: (requestId: number) => void;
	onDeclineRequest: (requestId: number) => void;
}) {
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

function FriendRow({
	friend,
	status,
	onOpenProfile,
	onRemove,
}: {
	friend: PublicUser;
	status: FriendStatus;
	onOpenProfile: () => void;
	onRemove: () => void;
}) {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-3">
			<div>
				<UserRow user={friend} onClick={onOpenProfile} />

				<p className="text-xs mt-1 flex items-center gap-2">
					<StatusDot activity={status.activity} />

					<span className={getStatusTextClass(status.activity)}>
						<StatusLabel activity={status.activity} />
					</span>
				</p>
			</div>

			<Button size="sm" variant="danger" onClick={onRemove}>
				<Trash2 size={16} />
				{t("friends.actions.remove")}
			</Button>
		</div>
	);
}

function StatusLabel({
	activity,
}: {
	activity: FriendStatus["activity"];
}) {
	const { t } = useTranslation();

	if (activity === "offline") {
		return <>{t("friends.status.offline")}</>;
	}

	if (activity === "available") {
		return (
			<>
				{t("friends.status.online")}
				{" · "}
				{t("friends.status.available")}
			</>
		);
	}

	if (activity === "waiting") {
		return (
			<>
				{t("friends.status.online")}
				{" · "}
				{t("friends.status.waiting")}
			</>
		);
	}

	return (
		<>
			{t("friends.status.online")}
			{" · "}
			{t("friends.status.inGame")}
		</>
	);
}

function getStatusTextClass(activity: FriendStatus["activity"]): string {
	if (activity === "offline") {
		return "text-red-400/80";
	}

	if (activity === "waiting") {
		return "text-yellow-300";
	}

	if (activity === "playing") {
		return "text-cyan-300";
	}

	return "text-green-400";
}

function UserRow({
	user,
	onClick,
}: {
	user: PublicUser;
	onClick?: () => void;
}) {
	return (
		<div
			className={`flex items-center gap-3 min-w-0 overflow-visible ${
				onClick ? "cursor-pointer" : ""
			}`}
			onClick={onClick}
		>
			<Avatar
				src={user.avatar}
				alt={user.username}
				fallback={user.username[0]?.toUpperCase() ?? "?"}
				size="sm"
			/>

			<div className="min-w-0">
				<Username
					className="font-semibold"
					name={user.username}
					variant="card"
				/>

				<p className="text-xs text-white/40 truncate">
					{user.xp} XP
				</p>
			</div>
		</div>
	);
}

function StatusDot({
	activity,
}: {
	activity: FriendStatus["activity"];
}) {
	if (activity === "offline") {
		return (
			<span className="inline-flex size-2.5 rounded-full bg-red-400/70" />
		);
	}

	if (activity === "waiting") {
		return (
			<span className="inline-flex size-2.5 rounded-full bg-yellow-400" />
		);
	}

	if (activity === "playing") {
		return (
			<span className="relative flex size-2.5">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
				<span className="relative inline-flex size-2.5 rounded-full bg-cyan-400" />
			</span>
		);
	}

	return (
		<span className="relative flex size-2.5">
			<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
			<span className="relative inline-flex size-2.5 rounded-full bg-green-400" />
		</span>
	);
}
