import { NavLink } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full text-center py-6 text-white/40 border-t border-white/10 bg-black/20 backdrop-blur">
            
            <nav className="flex justify-center gap-12 font-black uppercase text-xl z-50">

                <NavLink
                    to="/Privacy"
                    className={({ isActive }) =>
                        isActive
                            ? "text-white"
                            : "text-white/40 hover:text-white transition-colors"
                    }
                >
                    Privacy Policy
                </NavLink>

                <NavLink
                    to="/Terms"
                    className={({ isActive }) =>
                        isActive
                            ? "text-white"
                            : "text-white/40 hover:text-white transition-colors"
                    }
                >
                    Terms
                </NavLink>

            </nav>
            
        </footer>
    )
}