import {
	Check,
	Inbox,
	Send,
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
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyStateCard } from "@/components/ui/EmptyCard";
import { Input } from "@/components/ui/Input";
import {
	friendsService,
	type FriendStatus,
	type PublicUser,
} from "@/services/friendsService";
import { getBackendErrorMessage } from "../utils/getBackendErrorMessage";

import { FriendRow } from "@/components/friends/FriendRow";
import { SearchResultRow } from "@/components/friends/SearchResultRow";
import { UserRow } from "@/components/friends/UserRow";

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

const SEARCH_PAGE_SIZE = 10;

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
	const [lastSearchQuery, setLastSearchQuery] = useState("");
	const [searchOffset, setSearchOffset] = useState(0);
	const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);

	const currentSearchPage = Math.floor(searchOffset / SEARCH_PAGE_SIZE) + 1;
	const hasPreviousSearchPage = searchOffset > 0;
	const [hasNextSearchPage, setHasNextSearchPage] = useState(false);

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
	 * Loads one page of user search results.
	 *
	 * This helper centralizes paginated search loading so:
	 * - initial searches
	 * - next page requests
	 * - previous page requests
	 *
	 * all reuse the same API logic and loading state handling.
	 *
	 * @param query - Username search query.
	 * @param offset - Number of users skipped before loading results.
	 * @returns Nothing. Updates local pagination and search result state.
	 */
	async function loadSearchResults(
		query: string,
		offset: number,
	): Promise<void> {
		setSearchLoading(true);

		try {
			const results = await friendsService.searchUsers(
				query,
				SEARCH_PAGE_SIZE + 1,
				offset,
			);

			setSearchResults(results.slice(0, SEARCH_PAGE_SIZE));
			setHasNextSearchPage(results.length > SEARCH_PAGE_SIZE);
			setSearchOffset(offset);
			setLastSearchQuery(query);
		} catch (error: unknown) {
			showActionError(error, "friends.errors.search");
		} finally {
			setSearchLoading(false);
		}
	}

	/**
	 * Searches users by username.
	 *
	 * @param event - Search form submit event.
	 * @returns Nothing. Updates local search result state.
	 */
	async function handleSearch(
		event: React.FormEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();

		const trimmedSearch = search.trim();

		if (!trimmedSearch) {
			setSearchResults([]);
			setSearchOffset(0);
			setLastSearchQuery("");
			setHasNextSearchPage(false);
			return;
		}

		await loadSearchResults(trimmedSearch, 0);
	}

	/**
	 * Loads the previous page of search results.
	 *
	 * @returns Nothing. Reuses the last submitted search query.
	 */
	async function handlePreviousSearchPage(): Promise<void> {
		if (!lastSearchQuery || !hasPreviousSearchPage) {
			return;
		}

		const previousOffset = Math.max(searchOffset - SEARCH_PAGE_SIZE, 0);

		await loadSearchResults(lastSearchQuery, previousOffset);
	}

	/**
	 * Loads the next page of search results.
	 *
	 * @returns Nothing. Reuses the last submitted search query.
	 */
	async function handleNextSearchPage(): Promise<void> {
		if (!lastSearchQuery || !hasNextSearchPage) {
			return;
		}

		await loadSearchResults(
			lastSearchQuery,
			searchOffset + SEARCH_PAGE_SIZE,
		);
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
						onChange={(event) => {
							const value = event.target.value;

							setSearch(value);

							if (!value.trim()) {
								setSearchResults([]);
								setSearchOffset(0);
								setLastSearchQuery("");
								setHasNextSearchPage(false);
							}
						}}
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
				{searchResults.length > 0 && (
					<div className="flex items-center justify-between pt-4">
						<Button
							size="sm"
							variant="secondary"
							onClick={handlePreviousSearchPage}
							disabled={!hasPreviousSearchPage || searchLoading}
						>
							{t("friends.search.previous")}
						</Button>

						<span className="text-sm text-white/50">
							{t("friends.search.page", {
								page: currentSearchPage,
							})}
						</span>

						<Button
							size="sm"
							variant="secondary"
							onClick={handleNextSearchPage}
							disabled={!hasNextSearchPage || searchLoading}
						>
							{t("friends.search.next")}
						</Button>
					</div>
				)}
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
