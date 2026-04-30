import { Link, useNavigate } from "react-router-dom";
import { AboutCard } from "@/components/home/AboutCard"
import { PlayCard } from "@/components/home/PlayCard"
import { GameHistoryCard } from "@/components/home/GameHistoryCard"
import type { Match } from "@/lib/match"
import { useEffect, useState } from "react"
import { useOutletContext } from "react-router"
import { userService } from "@/services/userService"

export default function Home() {
  const navigate = useNavigate();
  const [user] = useOutletContext<any>()
  const [matches, setMatches] = useState<Match[]>([])

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

  	useEffect(() => {
    	if (!user) return

    	userService.getUserHistory(user.id)
      	.then(setMatches)
  	}, [user])

  	return (
    	<section className="w-full flex flex-col gap-10">

    

    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">

    	{/* CARDS */}
    	<Link to="/profile" className="h-full">
            <AboutCard user={user}
            className="flex-1"
            />
        </Link>

        <Link to="/game">
            <PlayCard
            onFindOpponent={handleFindOpponent}
            />
        </Link>


        <Link to="/history" className="h-full">
            <GameHistoryCard
            matches={matches}
            />
        </Link>

    </div>
    </section>
  );
}
