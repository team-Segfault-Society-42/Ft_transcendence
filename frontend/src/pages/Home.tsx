import { Link } from "react-router-dom";
import { useState } from "react";
import SignupModal from "../components/layout/SignupModal";

export default function Home() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <section className="flex flex-col items-center text-center gap-12">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          ft_transcendence
        </h1>

        <p className="text-white/60 max-w-md mx-auto text-lg">
          Play. Compete. Improve. Challenge players and become the best.
        </p>
      </div>

      {/* REGISTER */}
      <button
        onClick={() => setShowSignup(true)}
        className="bg-linear-to-r from-cyan-500 to-purple-500 px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
      >
        REGISTER
      </button>

      {/* START GAME */}
      <Link
        to="/game"
        className="bg-linear-to-r from-cyan-500 to-purple-500 px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
      >
        START GAME
      </Link>

      {/* FIND AN OPPENENT */}
      <Link
        to="/game"
        className="bg-linear-to-r from-cyan-500 to-purple-500 px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
      >
        FIND AN OPPENENT
      </Link>

      {/* MODAL */}
      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">
        <Link
          to="/"
          className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 backdrop-blur hover:scale-105 transition group"
        >
          <h3 className="font-bold text-lg mb-2 group-hover:text-cyan-300 transition">
            🏠 Home
          </h3>
          <p className="text-white/70 text-sm">
            Welcome to the main page ! Explore the app !
          </p>
        </Link>

        <Link
          to="/game"
          className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 backdrop-blur hover:scale-105 transition group"
        >
          <h3 className="font-bold text-lg mb-2 group-hover:text-cyan-300 transition">
            🎮 Game
          </h3>
          <p className="text-white/70 text-sm">
            Start a match and challenge yourself.
          </p>
        </Link>

        <Link
          to="/profile"
          className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-xl p-6 backdrop-blur hover:scale-105 transition group"
        >
          <h3 className="font-bold text-lg mb-2 group-hover:text-cyan-300 transition">
            👤 Profile
          </h3>
          <p className="text-white/70 text-sm">
            View your stats and customize your profile.
          </p>
        </Link>
      </div>
    </section>
  );
}
