import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import Footer from "./Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { useEffect, useState, useRef } from "react";
import { userService } from "@/services/userService";
import { Spinner } from "@/components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Chatbar } from "./Chatbar";
import { Button } from "../ui/Button";
import { useActiveGameStore } from "@/Store/activeGameStore";
import { connectPresenceSocket, disconnectPresenceSocket,} from "@/services/presenceSocket";
import { friendsService } from "@/services/friendsService";
import { usePresenceStore } from "@/Store/presenceStore";
import type { FriendStatus } from "@/services/friendsService";
import type { User } from "@/type/user.types";
import { MessageCircle } from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation();

  const [activeModal, setActiveModal] = useState<"signup" | "login" | null>(
    null,
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChat, setIsChat] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

	const setFriendStatus = usePresenceStore(
		(state) => state.setFriendStatus,
	);

	const updateFriendStatus = usePresenceStore(
		(state) => state.updateFriendStatus,
	);

	const clearFriendStatus = usePresenceStore(
		(state) => state.clearFriendStatus,
	);

  const openLogin = () => setActiveModal("login");
  const closeModals = () => setActiveModal(null);
  const handleChatClick = () => setIsChat((prev) => !prev);

  const fetchActiveGame = useActiveGameStore(
    (state) => state.fetchActiveGame,
  );

  const setActiveGame = useActiveGameStore(
    (state) => state.setActiveGame,
  );
  
  const clearActiveGame = useActiveGameStore(
    (state) => state.clearActiveGame,
  );

  const activeGame = useActiveGameStore((state) => state.activeGame);
  const previousStatus = useRef<string | null>(null);

	useEffect(() => {
	  if (previousStatus.current === "waiting" && activeGame?.status === "playing") {
		  navigate(`/game/${activeGame.gameId}`);
	  }
	  previousStatus.current = activeGame?.status ?? null;
	}, [activeGame, navigate]);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const result = await userService.getMe();
        setUser(result);
      } catch (error: any) {
        if (error.response?.status != 401) {
          const serverMessage = error.response?.data?.message || error.message;
          const finalMessage = Array.isArray(serverMessage)
            ? serverMessage[0]
            : serverMessage;
          toast.error(t("auth.errorWithMessage", { message: finalMessage }));
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    getCurrentUser();
  }, []);

	useEffect(() => {
		if (!user) {
			clearFriendStatus();
      clearActiveGame();
			disconnectPresenceSocket();
			return;
		}

		const socket = connectPresenceSocket();
    
		async function initializeRealtime() {
			try {
				const statuses = await friendsService.getFriendsStatus();
				setFriendStatus(statuses);
        await fetchActiveGame();
			} catch (error) {
				console.error("[PresenceSocket] initialization failed", error);
			}
		}

		initializeRealtime();


		socket.on("friend_status_changed", (status: FriendStatus) => {
			updateFriendStatus(status);
		});

    socket.on("active_game_updated", (activeGame) => {

      if (!activeGame) {
        clearActiveGame();
        return;
      }
    
      setActiveGame(activeGame);
    });

		socket.on("friends_updated", () => {
			window.dispatchEvent(new Event("friends_updated"));
		});

		socket.on("connect_error", (error: Error) => {
			console.error("[PresenceSocket] connection error:", error.message);
		});

		return () => {
			socket.off("friend_status_changed");
      socket.off("active_game_updated");
			socket.off("connect_error");
		};
	}, [
		user,
		setFriendStatus,
		updateFriendStatus,
		clearFriendStatus,
    setActiveGame,
	  clearActiveGame,
	  fetchActiveGame,
	]);

  async function handleLogout() {
    try {
      const response = await userService.userLogout();

      setUser(null);

      const message = response.message || t("auth.logoutSuccess");
      toast.success(message);
      navigate("/");
    } catch {
      setUser(null);
    }
  }

  async function handleLoginSuccess() {
    const result = await userService.getMe();
    setUser(result);
    closeModals();
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center ">
        <Spinner variant="cyan" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-900 via-slate-800 to-black text-white">

      <Sidebar
      user={user}
      onLoginClick={openLogin}
      onLogoutClick={handleLogout}
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      />

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

      {/* MODAL GLOBAL */}
      <AuthModal
        mode={activeModal === "login" ? "login" : "signup"}
        isOpen={activeModal !== null}
        onClose={closeModals}
        onSwitchMode={() =>
          setActiveModal(activeModal === "login" ? "signup" : "login")
        }
        onSuccess={handleLoginSuccess}
      />

    {user && (
	  <>
		  <Button
			onClick={handleChatClick}
			className="fixed bottom-6 right-6 z-30 rounded-full p-3"
		  >
			  <MessageCircle size={22} />
		  </Button>

		  {isChat && (
			  <div
				className="fixed inset-0 bg-black/50 z-40"
				onClick={handleChatClick}
			  />
		  )}

		  <div
			  className={`
				fixed inset-y-0 right-0 z-50 w-80
				bg-slate-900 border-l border-white/10
				transform transition-transform duration-300
				${isChat ? "translate-x-0" : "translate-x-full"}
			  `}
		  >
			  <Chatbar onClose={handleChatClick} />
		  </div>
	  </>
  )}
  </div>
)}
