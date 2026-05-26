import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { useActiveGameStore } from "@/Store/activeGameStore";
import { useFriendsStore } from "@/Store/friendsStore";
import { usePresenceStore } from "@/Store/presenceStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
	connectPresenceSocket,
	disconnectPresenceSocket,
} from "@/services/presenceSocket";
import { friendsService } from "@/services/friendsService";
import {
	userService,
	type AuthenticatedUser,
} from "@/services/userService";
import { getBackendErrorMessage } from "../../utils/getBackendErrorMessage";
import { Chatbar } from "./Chatbar";
import Footer from "./Footer";

type AuthModalMode = "signup" | "login";

type ActiveGameSocketPayload = {
	gameId: string;
	status: "idle" | "waiting" | "playing";
	playerX?: {
		username: string;
		avatar?: string;
	};
	playerO?: {
		username: string;
		avatar?: string;
	};
};

export default function Dashboard() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [activeModal, setActiveModal] = useState<AuthModalMode | null>(null);
	const [user, setUser] = useState<AuthenticatedUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const previousStatus = useRef<string | null>(null);

	const setFriendStatus = usePresenceStore((state) => state.setFriendStatus);
	const updateFriendStatus = usePresenceStore(
		(state) => state.updateFriendStatus,
	);
	const clearFriendStatus = usePresenceStore(
		(state) => state.clearFriendStatus,
	);

	const loadFriendsData = useFriendsStore((state) => state.loadFriendsData);
	const clearFriendsData = useFriendsStore((state) => state.clearFriendsData);

	const activeGame = useActiveGameStore((state) => state.activeGame);
	const fetchActiveGame = useActiveGameStore((state) => state.fetchActiveGame);
	const setActiveGame = useActiveGameStore((state) => state.setActiveGame);
	const clearActiveGame = useActiveGameStore((state) => state.clearActiveGame);

	const openLogin = () => setActiveModal("login");
	const closeModals = () => setActiveModal(null);
	const toggleChat = () => setIsChatOpen((previous) => !previous);

	/**
	 * Displays a translated backend error toast.
	 *
	 * @param error - Unknown async error from an API call.
	 * @returns Nothing.
	 */
	function showSessionError(error: unknown): void {
		const finalMessage = getBackendErrorMessage(error);

		toast.error(
			t("auth.errorWithMessage", {
				message: t(`backend.${finalMessage}`, {
					defaultValue: finalMessage,
				}),
			}),
		);
	}

	/**
	 * Clears frontend-only state that belongs to the authenticated user.
	 *
	 * @returns Nothing.
	 * @remarks Frontend cleanup is not authorization. The backend session remains the source of truth.
	 */
	function clearAuthenticatedFrontendState(): void {
		setUser(null);
		clearFriendStatus();
		clearFriendsData();
		clearActiveGame();
		disconnectPresenceSocket();
	}

	/**
	 * Loads initial realtime data after a valid session is available.
	 *
	 * @returns Nothing. Updates presence, friends, and active game stores.
	 */
	async function initializeRealtimeState(): Promise<void> {
		const statuses = await friendsService.getFriendsStatus();

		setFriendStatus(statuses);
		await loadFriendsData();
		await fetchActiveGame();
	}

	useEffect(() => {
		if (
			previousStatus.current === "waiting" &&
			activeGame?.status === "playing"
		) {
			navigate(`/game/${activeGame.gameId}`);
		}

		previousStatus.current = activeGame?.status ?? null;
	}, [activeGame, navigate]);

	useEffect(() => {
		async function getCurrentUser(): Promise<void> {
			try {
				const result = await userService.getSession();

				setUser(result.authenticated ? result.user : null);
			} catch (error: unknown) {
				showSessionError(error);
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		}

		getCurrentUser();
	}, []);

		useEffect(() => {
		if (!user) {
			clearAuthenticatedFrontendState();
			return;
		}

		const socket = connectPresenceSocket();

		initializeRealtimeState().catch((error: unknown) => {
			if (import.meta.env.DEV) {
				console.warn("[PresenceSocket] initialization failed:", error);
			}
		});

		const handleReconnect = () => {
			initializeRealtimeState().catch((error: unknown) => {
				if (import.meta.env.DEV) {
					console.warn("[PresenceSocket] reconnect reload failed:", error);
				}
			});
		};

		const handleFriendRelationshipEvent = () => {
			initializeRealtimeState().catch((error: unknown) => {
				if (import.meta.env.DEV) {
					console.warn("[PresenceSocket] friend reload failed:", error);
				}
			});
		};

		const handleActiveGameUpdated = (
			activeGameUpdate: ActiveGameSocketPayload | null,
		) => {
			if (!activeGameUpdate) {
				clearActiveGame();
				return;
			}

			setActiveGame(activeGameUpdate);
		};

		const handleConnectError = (error: Error) => {
			if (import.meta.env.DEV) {
				console.warn("[PresenceSocket] connection error:", error.message);
			}
		};

		socket.on("connect", handleReconnect);
		socket.on("friend_status_changed", updateFriendStatus);
		socket.on("active_game_updated", handleActiveGameUpdated);
		socket.on("friend_request_sent", handleFriendRelationshipEvent);
		socket.on("friend_request_received", handleFriendRelationshipEvent);
		socket.on("friend_request_accepted", handleFriendRelationshipEvent);
		socket.on("friend_request_declined", handleFriendRelationshipEvent);
		socket.on("friend_removed", handleFriendRelationshipEvent);
		socket.on("connect_error", handleConnectError);

		return () => {
			socket.off("connect", handleReconnect);
			socket.off("friend_status_changed", updateFriendStatus);
			socket.off("active_game_updated", handleActiveGameUpdated);
			socket.off("friend_request_sent", handleFriendRelationshipEvent);
			socket.off("friend_request_received", handleFriendRelationshipEvent);
			socket.off("friend_request_accepted", handleFriendRelationshipEvent);
			socket.off("friend_request_declined", handleFriendRelationshipEvent);
			socket.off("friend_removed", handleFriendRelationshipEvent);
			socket.off("connect_error", handleConnectError);
		};
	}, [
		user,
		setFriendStatus,
		updateFriendStatus,
		clearFriendStatus,
		loadFriendsData,
		clearFriendsData,
		setActiveGame,
		clearActiveGame,
		fetchActiveGame,
	]);

	async function handleLogout(): Promise<void> {
		try {
			const response = await userService.userLogout();

			clearAuthenticatedFrontendState();

			const message = response.message || t("auth.logoutSuccess");

			toast.success(message);
			navigate("/");
		} catch (error: unknown) {
			if (import.meta.env.DEV) {
				console.warn("[Auth] logout failed:", error);
			}
			clearAuthenticatedFrontendState();
		}
	}

	async function handleLoginSuccess(): Promise<void> {
		const result = await userService.getMe();

		setUser(result);
		closeModals();
	}

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<Spinner variant="cyan" size="lg" />
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-linear-to-br from-slate-900 via-slate-800 to-black text-white">
			{/* Sidebar */}
			<Sidebar
				user={user}
				onLoginClick={openLogin}
				onLogoutClick={handleLogout}
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			{/* Main layout */}
			<div className="flex-1 flex flex-col min-w-0">
				<Topbar
					user={user}
					onLoginClick={openLogin}
					onMenuClick={() => setIsSidebarOpen(true)}
				/>

				<main className="flex-1 overflow-y-auto p-6">
					<Outlet context={[user, setUser]} />
				</main>

				<Footer />
			</div>

			{/* Global auth modal */}
			<AuthModal
				mode={activeModal === "login" ? "login" : "signup"}
				isOpen={activeModal !== null}
				onClose={closeModals}
				onSwitchMode={() =>
					setActiveModal(activeModal === "login" ? "signup" : "login")
				}
				onSuccess={handleLoginSuccess}
			/>

			{/* Chat drawer */}
			{user && (
				<>
					<Button
						onClick={toggleChat}
						className="fixed bottom-6 right-6 z-30 rounded-full p-3"
					>
						<MessageCircle size={22} />
					</Button>

					{isChatOpen && (
						<div
							className="fixed inset-0 bg-black/50 z-40"
							onClick={toggleChat}
						/>
					)}

					<div
						className={`
							fixed inset-y-0 right-0 z-50 w-80
							bg-slate-900 border-l border-white/10
							transform transition-transform duration-300
							${isChatOpen ? "translate-x-0" : "translate-x-full"}
						`}
					>
						<Chatbar onClose={toggleChat} />
					</div>
				</>
			)}
		</div>
	);
}
