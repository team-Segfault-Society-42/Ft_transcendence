import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Profile from './pages/Profile';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/game" element={<Game />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</Router>
	);
}

export default App;