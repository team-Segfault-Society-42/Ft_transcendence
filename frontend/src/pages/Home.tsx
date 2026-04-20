import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { gameApi } from "@/services/gameApi"; 

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleFindOpponent = async () => {
    try {
      const response = await fetch("/api/game/create", {
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
	const handleLogin42 = () => {
	const oauth42Url =
		import.meta.env.VITE_OAUTH_42_START_URL ?? "https://127.0.0.1:8443/api/auth/42";

	window.location.href = oauth42Url;
	};

  return (
    <section className="flex flex-col items-center text-center gap-12">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>

        <p className="text-white/60 max-w-md mx-auto text-lg">
          {t("home.hero.texte")}
        </p>
      </div>

      {/* BUTTONS */}
      <Button onClick={() => console.log("play local later")} size="xl">
        {t("home.buttons.local")}
      </Button>

      <Button onClick={handleFindOpponent} size="xl">
        {t("home.buttons.findOpp")}
      </Button>

      <Button
        onClick={handleLogin42}
        size="xl">
        Login with 42
      </Button>



      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">
        <Link to="/">
          <Card>
            <CardTitle>{t("home.cards.home.title")}</CardTitle>
            <CardDescription>
              {t("home.cards.home.description")}
            </CardDescription>
          </Card>
        </Link>

        <Link to="/game">
          <Card>
            <CardTitle>{t("home.cards.game.title")}</CardTitle>
            <CardDescription>
              {t("home.cards.game.description")}
            </CardDescription>
          </Card>
        </Link>

        <Link to="/profile" className="card">
          <Card>
            <CardTitle>{t("home.cards.profile.title")}</CardTitle>
            <CardDescription>
              {t("home.cards.profile.description")}
            </CardDescription>
          </Card>
        </Link>
      </div>
    </section>
  );
}
