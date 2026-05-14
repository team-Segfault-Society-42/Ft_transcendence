import {
	UsersRound,
	UserPlus,
	Inbox,
	Send,
	Trash2,
	Check,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardTitle } from "@/components/ui/Card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	friendsService,
	type FriendListItem,
	type IncomingFriendRequest,
	type OutgoingFriendRequest,
	type PublicUser,
	type FriendStatus,
} from "@/services/friendsService";
import { usePresenceStore } from "@/Store/presenceStore";

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

type RelationshipState =
	| "SELF"
	| "FRIEND"
	| "PENDING_SENT"
	| "PENDING_RECEIVED"
	| "NONE";

export default function Friends() {
	const { t } = useTranslation();
	const [user] = useOutletContext<[CurrentUser | null]>();
	const navigate = useNavigate();

	const [friends, setFriends] = useState<FriendListItem[]>([]);
	const [incomingRequests, setIncomingRequests] = useState<IncomingFriendRequest[]>([]);
	const [outgoingRequests, setOutgoingRequests] = useState<OutgoingFriendRequest[]>([]);
	const [search, setSearch] = useState("");
	const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const friendStatus = usePresenceStore(
		(state) => state.friendStatus,
	);

	const loadFriendsData = useCallback(async () => {
		if (!user) return;

		try {
			setLoading(true);

			const [friendsData, incomingData, outgoingData] = await Promise.all([
				friendsService.getFriends(),
				friendsService.getIncomingFriendRequests(),
				friendsService.getOutgoingFriendRequests(),
			]);

			setFriends(friendsData);
			setIncomingRequests(incomingData);
			setOutgoingRequests(outgoingData);
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			toast.error(t("friends.errors.load", { error: message }));
		} finally {
			setLoading(false);
		}
	}, [user, t]);

	const mergeFriendStatus = usePresenceStore(
		(state) => state.mergeFriendStatus,
	);


	useEffect(() => {
		loadFriendsData();
	}, [loadFriendsData]);

	useEffect(() => {
		async function handleFriendsUpdated() {
			await loadFriendsData();
			await refreshFriendStatuses();
		}

		window.addEventListener("friends_updated", handleFriendsUpdated);

		return () => {
			window.removeEventListener("friends_updated", handleFriendsUpdated);
		};
	}, [loadFriendsData]);


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
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			toast.error(t("friends.errors.search", { error: message }));
		} finally {
			setSearchLoading(false);
		}
	}

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

	async function handleSendRequest(userId: number) {
		try {
			await friendsService.sendFriendRequest(userId);
			toast.success(t("friends.success.requestSent"));
			await loadFriendsData();
			await refreshFriendStatuses();
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			toast.error(t("friends.errors.action", { error: message }));
		}
	}

	async function handleAcceptRequest(requestId: number) {
		try {
			await friendsService.acceptFriendRequest(requestId);
			toast.success(t("friends.success.accepted"));
			await loadFriendsData();
			await refreshFriendStatuses();
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			toast.error(t("friends.errors.action", { error: message }));
		}
	}

	async function handleDeclineRequest(requestId: number) {
		try {
			await friendsService.declineFriendRequest(requestId);
			toast.success(t("friends.success.declined"));
			await loadFriendsData();
			await refreshFriendStatuses();
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			toast.error(t("friends.errors.action", { error: message }));
		}
	}

	async function handleRemoveFriend(friendshipId: number) {
		try {
			await friendsService.removeFriend(friendshipId);
			toast.success(t("friends.success.removed"));
			await loadFriendsData();
			await refreshFriendStatuses();
		} catch (error: any) {
			const message = error.response?.data?.message || error.message;
			toast.error(t("friends.errors.action", { error: message }));
		}
	}

	async function refreshFriendStatuses() {
		const statuses = await friendsService.getFriendsStatus();
		mergeFriendStatus(statuses);
	}

	const incomingRequestBySenderId = useMemo(() => {
		return new Map(
			incomingRequests.map((request) => [request.sender.id, request]),
		);
	}, [incomingRequests]);

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
			<div className="mb-8 text-center">
				<h1 className="bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent text-3xl font-bold">
					{t("friends.title")}
				</h1>
				<p className="text-white/50 mt-2">
					{t("friends.description")}
				</p>
			</div>

			<Card className="mb-6">
				<CardTitle className="flex items-center gap-2">
					<UserPlus size={20} />
					{t("friends.search.title")}
				</CardTitle>

				<form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
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
							<div
								key={result.id}
								className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-3"
							>
								<UserRow user={result} />

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

								{state === "PENDING_RECEIVED" && incomingRequest && (
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={() => handleAcceptRequest(incomingRequest.requestId)}
										>
											{t("friends.actions.accept")}
										</Button>
										<Button
											size="sm"
											variant="secondary"
											onClick={() => handleDeclineRequest(incomingRequest.requestId)}
										>
											{t("friends.actions.decline")}
										</Button>
									</div>
								)}

								{state === "NONE" && (
									<Button
										size="sm"
										onClick={() => handleSendRequest(result.id)}
									>
										{t("friends.actions.add")}
									</Button>
								)}
							</div>
						);
					})}
				</div>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
								const status = friendStatus[item.friend.id];

								return (
									<div
										key={item.friendshipId}
										className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-3"
									>
										<div>
											<UserRow user={item.friend} />
											<p className="text-xs mt-1 flex items-center gap-2">
												<StatusDot activity={status?.activity ?? "offline"} />

												<span
													className={
														status?.activity === "offline"
															? "text-red-400/80"
															: status?.activity === "waiting"
																? "text-yellow-300"
																: status?.activity === "playing"
																	? "text-cyan-300"
																	: "text-green-400"
													}
												>
													{status?.activity === "offline" && t("friends.status.offline")}

													{status?.activity === "available" && (
														<>
															{t("friends.status.online")}
															{" · "}
															{t("friends.status.available")}
														</>
													)}

													{status?.activity === "waiting" && (
														<>
															{t("friends.status.online")}
															{" · "}
															{t("friends.status.waiting")}
														</>
													)}

													{status?.activity === "playing" && (
														<>
															{t("friends.status.online")}
															{" · "}
															{t("friends.status.inGame")}
														</>
													)}
												</span>
											</p>
										</div>

										<Button
											size="sm"
											variant="danger"
											onClick={() => handleRemoveFriend(item.friendshipId)}
										>
											<Trash2 size={16} />
											{t("friends.actions.remove")}
										</Button>
									</div>
								);
							})}
						</div>
					)}
				</Card>

				<div className="space-y-6">
					<Card>
						<CardTitle className="flex items-center gap-2">
							<Inbox size={20} />
							{t("friends.requests.incoming")}
						</CardTitle>

						{loading ? (
							<p className="text-white/50">{t("friends.loading")}</p>
						) : incomingRequests.length === 0 ? (
							<p className="text-white/50">{t("friends.requests.noIncoming")}</p>
						) : (
							<div className="space-y-3">
								{incomingRequests.map((request) => (
									<div
										key={request.requestId}
										className="flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl p-3"
									>
										<UserRow user={request.sender} />

										<div className="flex gap-2 justify-center">
											<Button
												size="sm"
												onClick={() => handleAcceptRequest(request.requestId)}
												aria-label={t("friends.actions.accept")}
												title={t("friends.actions.accept")}
												className="px-10"
											>
												<Check size={16} />
											</Button>

											<Button
												size="sm"
												variant="secondary"
												onClick={() => handleDeclineRequest(request.requestId)}
												aria-label={t("friends.actions.decline")}
												title={t("friends.actions.decline")}
												className="px-10"
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
							<p className="text-white/50">{t("friends.requests.noOutgoing")}</p>
						) : (
							<div className="space-y-3">
								{outgoingRequests.map((request) => (
									<div
										key={request.requestId}
										className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-3"
									>
										<UserRow user={request.receiver} />
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

function UserRow({ user }: { user: PublicUser }) {
	return (
		<div className="flex items-center gap-3 min-w-0">
			<Avatar
				src={user.avatar}
				alt={user.username}
				fallback={user.username[0]?.toUpperCase() ?? "?"}
				size="sm"
			/>
			<div className="min-w-0">
				<p className="font-semibold truncate">{user.username}</p>
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
