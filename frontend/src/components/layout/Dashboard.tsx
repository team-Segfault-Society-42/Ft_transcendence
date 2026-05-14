import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import Footer from "./Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import { Spinner } from "@/components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Chatbar } from "./Chatbar";
import { Button } from "../ui/Button";
import { useActiveGameStore } from "@/Store/activeGameStore";
import {
	connectPresenceSocket,
	disconnectPresenceSocket,
} from "@/services/presenceSocket";

import { friendsService } from "@/services/friendsService";

import { usePresenceStore } from "@/Store/presenceStore";

import type { FriendStatus } from "@/services/friendsService";

export default function Dashboard() {
  const { t } = useTranslation();

  const [activeModal, setActiveModal] = useState<"signup" | "login" | null>(
    null,
  );
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChat, setIsChat] = useState(false);

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
    fetchActiveGame();
  
    const interval = setInterval(() => {
      fetchActiveGame();
    }, 2000);
  
    return () => clearInterval(interval);
  }, [fetchActiveGame]);
	useEffect(() => {
		if (!user) {
			clearFriendStatus();
			disconnectPresenceSocket();
			return;
		}

		const socket = connectPresenceSocket();

		async function loadFriendStatuses() {
			try {
				const statuses = await friendsService.getFriendsStatus();
				setFriendStatus(statuses);
			} catch (error) {
				console.error("[PresenceSocket] failed to load statuses", error);
			}
		}

		loadFriendStatuses();


		socket.on("friend_status_changed", (status: FriendStatus) => {

			updateFriendStatus(status);
		});

		socket.on("friends_updated", () => {
			window.dispatchEvent(new Event("friends_updated"));
		});

		socket.on("connect_error", (error: Error) => {
			console.error("[PresenceSocket] connection error:", error.message);
		});

		return () => {
			socket.off("friend_status_changed");
			socket.off("connect_error");
		};
	}, [
		user,
		setFriendStatus,
		updateFriendStatus,
		clearFriendStatus,
	]);

  async function handleLogout() {
    try {
      const response = await userService.userLogout();

      setUser(null);

      const message = response.message
      ? t(`backend.${response.message}`)
      : t("auth.logoutSuccess");
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
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          user={user}
          onLoginClick={openLogin}
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

      {!isChat && (
        <Button
          onClick={handleChatClick}
          className="fixed bottom-6 right-6 z-50"
        >
          Open chat
        </Button>
      )}
      {user && isChat && <Chatbar onClose={handleChatClick} />}
    </div>
  );
}
