import type { GameState } from "@/type/game.types";
import { useEffect, useState } from "react";

const TURN_TIMEOUT_SECONDS = 30;

export function useGameTimer(game: GameState | null) {
  const [timeLeft, setTimeLeft] = useState(TURN_TIMEOUT_SECONDS);

  useEffect(() => {
    if (!game || game.status !== "playing") {
      const timer = setTimeout(() => setTimeLeft(TURN_TIMEOUT_SECONDS), 0);
      return () => clearTimeout(timer);
    }
    const updateTimeLeft = () => {
      const seconds = Math.floor((Date.now() - game.lastMove) / 1000);
      const remainSecond = Math.max(0, TURN_TIMEOUT_SECONDS - seconds);
      setTimeLeft(remainSecond);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [game]);

  return timeLeft;
}
