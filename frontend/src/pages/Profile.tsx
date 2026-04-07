import avatarImg from "/avatar.png"
import { useEffect, useState } from 'react'
import { userService } from '../services/userService'
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useOutletContext } from "react-router";
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from 'react-router-dom';
import { Avatar } from "@/components/ui/Avatar"

interface User {
    id: number
    username: string,
    wins: number,
    losses: number,
    bio: string,
    avatar: string
}

export default function Profile() {


  const { t } = useTranslation()
  const [user, setUser] = useOutletContext<[User | null, React.Dispatch<React.SetStateAction<User | null>>]>();

  const [isEdit, isInEdit] = useState(false)
  const [userName, setUserName] = useState(user?.username || "")
  const [bio, setBio] = useState(user?.bio || "")
  const navigate = useNavigate()

  if (!user) {
    return ( 
    <div>
      <Spinner className="size-16 text-cyan-600" />
    </div>
    )
  }

  const totalGames = user.wins + user.losses
  const winrate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : "0"
    
    async function handleSave() {
        if (isEdit) {
          try {
            await userService.updateUser(user.id, { username: userName, bio: bio })
            setUser({... user, username: userName, bio: bio})
            toast.info( t("auth.buttons.edit"), { position: "top-left"})
          } catch (error: any) {
              const serverMessage = error.response?.data?.message || error.message
			        const finalMessage = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage
              toast.error(t("auth.error") + finalMessage, { position: "bottom-left" })
          }
        }
        isInEdit(!isEdit)
    }

    useEffect(() => {
      if (user) {
      setUserName(user.username)
      setBio(user.bio)
    }
  }, [user])

      
    return (
        <section className="w-full max-w-lg">
      
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 overflow-hidden">
      
            {/* GLOW BACKGROUND */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      
            {/* HEADER */}
            <div className="relative flex flex-col items-center gap-4">
      
            {/* AVATAR */}
            <div className="relative group">
              <Avatar
                src={user.avatar}
                alt={user.username}
                size="lg"
                className="border border-white/20 z-10 relative"/>
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md opacity-0 group-hover:opacity-100 transition"></div>
            </div>
      
              {/* USERNAME */}
              {isEdit ? (
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-center"/>
              ) : (
                <h1 className="text-2xl font-bold tracking-wide">
                  {user.username}
                </h1>
              )}
      
            </div>
      
            {/* STATS */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-center">
              {[
                { label: t("profile.stats.wins"), value: user.wins },
                { label: t("profile.stats.losses"), value: user.losses },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-lg py-4 border border-white/10 hover:scale-105 transition">

                  <p className="text-xs text-white/50">
                    {stat.label}
                  </p>

                  <p className="font-bold text-lg">
                    {stat.value}
                  </p>

                </div>
              ))}
            </div>
      
            {/* WINRATE */}
            <div className="mt-8">
      
              <div className="flex justify-between text-sm mb-2">

                <span className="text-white/50">
                  {t("profile.stats.winrate")}
                </span>

                <span className="font-semibold text-cyan-400">
                  {winrate}%
                </span>

              </div>
      
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-linear-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${winrate}%` }}
                />
              </div>
      
              <p className="text-xs text-white/50 mt-2">
                {t("profile.stats.games", { count: totalGames })}
              </p>
      
            </div>
      
            {/* BIO */}
            <div className="mt-8">
      
              <p className="text-white/50 text-sm mb-2">
                {t("profile.bio")}
              </p>
      
              {isEdit ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-transparent border border-white/20 rounded px-3 py-2 focus:outline-none focus:border-cyan-400 transition resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-sm leading-relaxed text-white/80">
                  {user.bio}
                </p>
              )}
      
            </div>
      
            {/* BUTTON */}
            <Button
              onClick={handleSave}>
              {isEdit ? t("profile.buttons.save") : t("profile.buttons.edit")}
            </Button>
      
          </div>
      
        </section>
      )
}