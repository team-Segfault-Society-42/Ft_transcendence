import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardTitle, CardDescription} from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Motion } from "@/components/ui/Motion";

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

    <Motion>
      <div className="space-y-6 ">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>

        <p className="bg-linear-to-r from-cyan-400 to-pink-500  bg-clip-text text-transparent max-w-md mx-auto text-lg">
          {t("home.hero.texte")}
        </p>
      </div>
    </Motion>

      {/* BUTTONS */}
      <Button
        onClick={() => console.log("play local later")}
        size="xl">
        {t("home.buttons.local")}
      </Button>

      <Button
        onClick={handleFindOpponent}
        size="xl">
        {t("home.buttons.findOpp")}
      </Button>

      

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 w-full">

        <Link to="/">
          <Card>
    					<CardTitle>
      						{t("home.cards.home.title")}
    					</CardTitle>
    					<CardDescription>
      						{t("home.cards.home.description")}
    					</CardDescription>
					</Card>
        </Link>

        <Link to="/game">
          <Card>
    					<CardTitle>
      						{t("home.cards.game.title")}
    					</CardTitle>
    					<CardDescription>
      						{t("home.cards.game.description")}
    					</CardDescription>
					</Card>
        </Link>

        <Link to="/profile" className="card">
          <Card>
    					<CardTitle>
      						{t("home.cards.profile.title")}
    					</CardTitle>
    					<CardDescription>
      						{t("home.cards.profile.description")}
    					</CardDescription>
					</Card>
        </Link>

      </div>
    </section>
  );
}