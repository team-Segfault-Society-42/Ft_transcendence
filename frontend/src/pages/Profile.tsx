import { useState } from 'react'
import avatarImg from "/avatar.png"

const MOCK_USER: infoUsers = {
    username: "SimSim",
    wins: 42,
    losses: 21,
    draws: 4,
    bio: "The Best !",
    avatar: avatarImg
}

interface infoUsers {
    username: string,
    wins: number,
    losses: number,
    draws: number,
    bio: string,
    avatar: string
}

export default function Profile() {

    const [data, setData] = useState<infoUsers>(MOCK_USER)
    const totalGames = data.wins + data.losses + data.draws
    const [isEdit, isInEdit] = useState(false)
    const [userName, setUserName] = useState(data.username)
    const [bio, setBio] = useState(data.bio)

    const winrate = totalGames > 0 ? ((data.wins / totalGames) * 100).toFixed(1) : "0"
    
    function handleSave() {
        if (isEdit) {
            setData({... data, username: userName, bio: bio})
        }
        isInEdit(!isEdit)   
    }
 
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
                <img
                  src={data.avatar}
                  alt="avatar"
                  className="w-24 h-24 rounded-full border border-white/20 object-cover z-10 relative"
                />
                <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-md opacity-0 group-hover:opacity-100 transition"></div>
              </div>
      
              {/* USERNAME */}
              {isEdit ? (
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent border border-white/20 rounded px-3 py-1 text-center focus:outline-none focus:border-cyan-400 transition"
                />
              ) : (
                <h1 className="text-2xl font-bold tracking-wide">
                  {data.username}
                </h1>
              )}
      
            </div>
      
            {/* STATS */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
      
              {[
                { label: "Wins", value: data.wins },
                { label: "Losses", value: data.losses },
                { label: "Draws", value: data.draws }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-lg py-4 border border-white/10 hover:scale-105 transition"
                >
                  <p className="text-xs text-white/50">{stat.label}</p>
                  <p className="font-bold text-lg">{stat.value}</p>
                </div>
              ))}
      
            </div>
      
            {/* WINRATE */}
            <div className="mt-8">
      
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/50">Winrate</span>
                <span className="font-semibold text-cyan-400">{winrate}%</span>
              </div>
      
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-linear-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${winrate}%` }}
                />
              </div>
      
              <p className="text-xs text-white/50 mt-2">
                {totalGames} games played
              </p>
      
            </div>
      
            {/* BIO */}
            <div className="mt-8">
      
              <p className="text-white/50 text-sm mb-2">Bio</p>
      
              {isEdit ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-transparent border border-white/20 rounded px-3 py-2 focus:outline-none focus:border-cyan-400 transition resize-none"
                  rows={3}
                />
              ) : (
                <p className="text-sm leading-relaxed text-white/80">
                  {data.bio}
                </p>
              )}
      
            </div>
      
            {/* BUTTON */}
            <button
              onClick={handleSave}
              className="mt-8 w-full bg-linear-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition hover:scale-[1.02] active:scale-95"
            >
              {isEdit ? "Save changes" : "Edit profile"}
            </button>
      
          </div>
      
        </section>
      )
}