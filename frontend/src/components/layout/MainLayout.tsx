import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import { AuthModal } from "@/components/auth/AuthModal"
import { useEffect, useState } from 'react'
import { userService } from "@/services/userService"
import { Spinner } from "@/components/ui/Spinner"
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useTranslation } from "react-i18next"


export default function MainLayout() {

  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<"signup" | "login" | null>(null)

	const openLogin = () => setActiveModal("login")
	const closeModals = () => setActiveModal(null)

  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const result = await userService.getMe()
        setUser(result)
        setIsLoading(false)

      } catch (error: any) {

        if (error.response?.status != 401) {
          const serverMessage = error.response?.data?.message || error.message
			    const finalMessage = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage
          toast.error(t("auth.error") + finalMessage, { position: "bottom-right" })
         }
         setUser(null)

        } finally {
          setIsLoading(false)
        }
      }
    getCurrentUser()
    }, [])

    async function handleLogout()
    {
      try {
        const response = await userService.userLogout()
        setUser(null)
        toast.success(response.message, {position: "top-left" })
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-black text-white">
        <Spinner 
        variant="cyan" 
        size="lg"
      />
      </div>
      )
    }
    return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-900 via-slate-800 to-black text-white">

      <Header
      onLoginClick={openLogin} 
      onLogoutClick={() => handleLogout()} 
      user={user} 
      />

      <main className="flex flex-1 justify-center items-start pt-14 pb-14 px-4">

        <div className="w-full max-w-4xl flex flex-col items-center">
          <Outlet context={[user, setUser]} />
        </div>
        
      </main>

      <Footer />

      <AuthModal
        mode={activeModal === "login" ? "login" : "signup"}
        isOpen={activeModal !== null}
        onClose={closeModals}
        onSwitchMode={() =>
        setActiveModal(activeModal === "login" ? "signup" : "login")
      }
      onSuccess={handleLoginSuccess}/>

    </div>
  )
}