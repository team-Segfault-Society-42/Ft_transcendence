import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import Footer from "./Footer"
import { AuthModal } from "@/components/auth/AuthModal"
import { useEffect, useState } from "react"
import { userService } from "@/services/userService"
import { Spinner } from "@/components/ui/Spinner"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export default function Dashboard() {

  const { t } = useTranslation()

  const [activeModal, setActiveModal] = useState<"signup" | "login" | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()

  const openLogin = () => setActiveModal("login")
  const closeModals = () => setActiveModal(null)

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const result = await userService.getMe()
        setUser(result)
      } catch (error: any) {
        if (error.response?.status != 401) {
          const serverMessage = error.response?.data?.message || error.message
          const finalMessage = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage
          toast.error(t("auth.errorWithMessage", { message: finalMessage }))
        }
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    getCurrentUser()
  }, [])

  async function handleLogout() {
    try {
      setUser(null)
      toast.success(t("auth.logoutSuccess"))
      navigate("/")
    } catch {
      setUser(null)
    }
  }

  async function handleLoginSuccess() {
    const result = await userService.getMe()
    setUser(result)
    closeModals()
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="cyan" size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-900 via-slate-800 to-black text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Topbar
          user={user}
          onLoginClick={openLogin}
          onLogoutClick={handleLogout}
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

    </div>
  )
}