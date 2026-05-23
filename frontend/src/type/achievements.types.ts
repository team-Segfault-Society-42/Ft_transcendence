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

/**
 * Mapping of Lucide icons associated with each in-game achievement.
 * The "as const" assertion ensures a read-only object for strict TypeScript typing.
 */
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

/**
 * Type representing the unique keys of available achievements.
 * Ensures that only valid keys from the ACHIEVEMENT_ICONS object can be used.
 */
export type IconKey = keyof typeof ACHIEVEMENT_ICONS
