import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { Toaster } from "sonner";

function App() {
	return (
		<div>
			<Routes>
				<Route element={<MainLayout />}>
					<Route path="/" element={<Home /> } Toaster richColors theme="dark" />
					<Route path="/game" element={<Game />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/privacy" element={<Privacy />} />
					<Route path="/terms" element={<Terms />} />
				</Route>
			</Routes>
			<Toaster richColors theme="dark" />
		</div>
	);
}

export default App;