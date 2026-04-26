import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { Toaster } from "./components/ui/Sonner";
import Dashboard from "./components/layout/Dashboard";
import LeaderBoard from "@/pages/Leaderboard";
import TwoFactorLogin from "./pages/TwoFactorLogin";
import LiveGamesDisplay from "./pages/LiveGames";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<Dashboard />}>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<LiveGamesDisplay />} />
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/two-factor" element={<TwoFactorLogin />} />
        </Route>
      </Routes>
      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
