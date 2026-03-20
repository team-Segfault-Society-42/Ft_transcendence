import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header className="w-full text-center py-6 text-white/20 border-t border-white/10 bg-black/20 backdrop-blur">

            <nav className="flex justify-center gap-12 font-black uppercase text-xl z-50">

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive
                            ? "text-white"
                            : "text-white/40 hover:text-white transition-colors"
                    }
                >
                    Home
                </NavLink>

                <NavLink
                    to="/game"
                    className={({ isActive }) =>
                        isActive
                            ? "text-white"
                            : "text-white/40 hover:text-white transition-colors"
                    }
                >
                    Game
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        isActive
                            ? "text-white"
                            : "text-white/40 hover:text-white transition-colors"
                    }
                >
                    Profile
                </NavLink>

            </nav>

        </header>
    )
}