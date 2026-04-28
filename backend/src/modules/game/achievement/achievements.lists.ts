export type AchievementKey =
    |   'FIRST_GAME'
    |   'FIRST_WIN'
    |   'DRAW_GAME'
    |   'LOSE_BY_TIME'

export const ACHIEVEMENTS: Record<AchievementKey, { key: AchievementKey, displayName: string, description: string }> = {

  FIRST_GAME: { key: 'FIRST_GAME', displayName: 'First of all', description: 'Play your first game.' },
  FIRST_WIN: { key: 'FIRST_WIN', displayName: 'First Blood', description: 'Win your first game.' },
  DRAW_GAME: { key: 'DRAW_GAME', displayName: 'Boring', description: 'Draw a game.' },
  LOSE_BY_TIME: { key: 'LOSE_BY_TIME', displayName: 'Noob', description: 'Lose a game by time.' },

} as const;
