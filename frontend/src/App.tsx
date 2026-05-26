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
import Play from "./pages/Play.tsx";
import Friends from "./pages/Friends";
import Rules from "./pages/Rules";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<Dashboard />}>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/spectate" element={<LiveGamesDisplay />} />
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/history" element={<History />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/two-factor" element={<TwoFactorLogin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
