import { Link } from 'react-router-dom';

export default function Navbar() {
	return (
		<nav className="text-lg fixed top-6 left-1/2 -translate-x-1/2 text-white/40 hover:text-white transition-colors flex items-center gap-12 font-black uppercase z-50">
			<Link to="/">Home</Link>
			<Link to="/game">Game</Link>
			<Link to="/profile">Profile</Link>
		</nav>
	);
}