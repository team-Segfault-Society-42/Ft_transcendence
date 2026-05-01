export type AchievementKey =
    |   'FIRST_GAME'
    |   'FIRST_WIN'
    |   'DRAW_GAME'
    |   'LOSE_BY_TIME'
    |   'WIN_5'
    |   'WIN_10'
    |   'WIN_50'

export const ACHIEVEMENTS: Record<AchievementKey, { key: AchievementKey, displayName: string, description: string }> = {

  FIRST_GAME: { key: 'FIRST_GAME', displayName: 'First of all', description: 'Play your first game.' },
  FIRST_WIN: { key: 'FIRST_WIN', displayName: 'First Blood', description: 'Win your first game.' },
  DRAW_GAME: { key: 'DRAW_GAME', displayName: 'Boring', description: 'Draw a game.' },
  LOSE_BY_TIME: { key: 'LOSE_BY_TIME', displayName: 'Noob', description: 'Lose a game by time.' },
  WIN_5: { key: 'WIN_5', displayName: 'High Five', description: 'Win a total of 5 matches.' },
  WIN_10: { key: 'WIN_10', displayName: 'Double Digits', description: 'Win a total of 10 matches.' },
  WIN_50: { key: 'WIN_50', displayName: 'Veteram', description: 'Win a total of 50 matches.' },

} as const;
