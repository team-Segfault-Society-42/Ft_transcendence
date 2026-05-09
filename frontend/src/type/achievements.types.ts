import {
  Medal,
  Trophy,
  Bed,
  ClockFading,
  Skull,
  Crosshair,
  Infinity,
  Crown,
} from "lucide-react";

export const ACHIEVEMENT_ICONS = {
  FIRST_GAME_TROPHY: Medal,
  FIRST_WIN_TROPHY: Trophy,
  DRAW_GAME_TROPHY: Bed,
  LOSE_BY_TIME_TROPHY: ClockFading,
  WIN_5_TROPHY: Crosshair,
  WIN_10_TROPHY: Skull,
  WIN_50_TROPHY: Infinity,
  GET_ALL_TROPHY: Crown,
} as const;

export type IconKey = keyof typeof ACHIEVEMENT_ICONS
