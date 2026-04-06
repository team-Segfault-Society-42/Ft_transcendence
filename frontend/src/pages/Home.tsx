import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleFindOpponent = async () => {
    try {
      const response = await fetch("http://localhost:1024/api/game/create", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data: { gameId: string } = await response.json();
      navigate(`/game/${data.gameId}`);
    } catch (error) {
      console.log("created game error:", error);
    }
  };

  return (
    <section className="flex flex-col items-center text-center gap-12">

      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          {t("title", { defaultValue: "ft_transcendence" })}
        </h1>

        <p className="text-white/60 max-w-md mx-auto text-lg">
          {t("home.hero.texte", {
            defaultValue:
              "Play. Compete. Improve. Challenge players and become the best.",
          })}
        </p>
      </div>

      {/* BUTTONS */}
      <Link to="/signup">
        <button className="bg-linear-to-r from-cyan-500 to-purple-500 px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95">
          {t("home.buttons.register")}
        </button>
      </Link>

      <button
        onClick={() => console.log("play local later")}
        className="bg-linear-to-r from-cyan-500 to-purple-500 px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
      >
        {t("home.buttons.playLocal", { defaultValue: "PLAY LOCAL" })}
      </button>

      <button
        onClick={handleFindOpponent}
        className="bg-linear-to-r from-cyan-500 to-purple-500 px-12 py-4 rounded-2xl font-black text-2xl shadow-xl transition-all hover:scale-110 active:scale-95"
      >
        {t("home.buttons.findOpponent", { defaultValue: "FIND AN OPPONENT" })}
      </button>

      

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">

        <Link to="/" className="card">
          <h3 className="font-bold text-lg mb-2">🏠 {t("home.cards.home.title")}</h3>
          <p className="text-white/70 text-sm">{t("home.cards.home.description")}</p>
        </Link>

        <Link to="/game" className="card">
          <h3 className="font-bold text-lg mb-2">🎮 {t("home.cards.game.title")}</h3>
          <p className="text-white/70 text-sm">{t("home.cards.game.description")}</p>
        </Link>

        <Link to="/profile" className="card">
          <h3 className="font-bold text-lg mb-2">👤 {t("home.cards.profile.title")}</h3>
          <p className="text-white/70 text-sm">{t("home.cards.profile.description")}</p>
        </Link>

      </div>
    </section>
  );
}