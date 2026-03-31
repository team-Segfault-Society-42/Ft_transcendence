import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import SignupModal from "./SignupModal"
import LoginModal from "./LoginModal"
import { useEffect, useState } from 'react'


export default function MainLayout() {

  	const [activeModal, setActiveModal] = useState<"signup" | "login" | null>(null)

	  const openLogin = () => setActiveModal("login")
	  const openSignup = () => setActiveModal("signup")
	  const closeModals = () => setActiveModal(null)

    const [user, setUser] = useState(null)
    const [loading, isLoading] = useState(true)

    useEffect(() => {
      
        }, [])

    return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-900 via-slate-800 to-black text-white">

      <Header onLoginClick={openLogin} />

      <main className="flex flex-1 justify-center items-start pt-14 pb-14 px-4">

        <div className="w-full max-w-4xl flex flex-col items-center">
          <Outlet />
        </div>
        
      </main>

      <Footer />

      <SignupModal
        isOpen={activeModal === "signup"}
        onClose={closeModals}
        onSwitchToSignin={openLogin}/>

      <LoginModal 
				isOpen={activeModal === "login"}
				onClose={closeModals}
        onSwitchToSignup={openSignup} />
    </div>
  )
}