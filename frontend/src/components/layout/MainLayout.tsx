import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-900 via-slate-800 to-black text-white">

      <Header />

      <main className="flex flex-1 justify-center items-start pt-14 pb-14 px-4">

        <div className="w-full max-w-4xl flex flex-col items-center">
          <Outlet />
        </div>
        
      </main>

      <Footer />
      
    </div>
  )
}