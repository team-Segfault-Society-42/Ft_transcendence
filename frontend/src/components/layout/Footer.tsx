import { NavLink } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-black/20 backdrop-blur text-white/40">

            <div className="relative max-w-6xl mx-auto px-6 py-4 flex items-center">

                <div className="text-white/60 font-semibold">
                    ft_transcendence
                </div>

                <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 uppercase tracking-wide text-sm">

                    <NavLink
                        to="/privacy"
                        className={({ isActive }) =>
                            isActive
                                ? "text-white"
                                : "hover:text-white transition-colors"
                        }>
                        Privacy
                    </NavLink>

                    <NavLink
                        to="/terms"
                        className={({ isActive }) =>
                            isActive
                                ? "text-white"
                                : "hover:text-white transition-colors"
                        }>
                        Terms
                    </NavLink>

                </nav>

                <div className="ml-auto text-xs text-white/30">
                    © {new Date().getFullYear()}
                </div>

            </div>

        </footer>
    )
}