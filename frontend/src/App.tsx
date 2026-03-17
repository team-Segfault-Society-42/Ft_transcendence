import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';

function App() {
	return (
		<div>
			<Navbar/>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/game" element={<Game />} />
			</Routes>
		</div>
	);
}

export default App;