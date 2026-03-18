import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Game from './pages/Game';

function App() {
	return (
		<div>
			<Routes>
				<Route element={<MainLayout />}>
					<Route path="/" element={<Home />} />
					<Route path="/game" element={<Game />} />
				</Route>
			</Routes>
		</div>
	);
}

export default App;