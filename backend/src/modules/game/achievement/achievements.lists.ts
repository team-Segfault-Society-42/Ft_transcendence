export type AchievementKey =
    |   'FIRST_GAME'
    |   'FIRST_WIN'
    |   'DRAW_GAME'
    |   'LOSE_BY_TIME'
    |   'WIN_5'
    |   'WIN_10'
    |   'WIN_50'
    |   'GET_ALL'
    

export const ACHIEVEMENTS: Record<AchievementKey, { key: AchievementKey, displayName: string, description: string, iconName: string }> = {

  FIRST_GAME: { key: 'FIRST_GAME', displayName: 'ACH_FIRST_GAME_TITLE', description: 'ACH_FIRST_GAME_DESC', iconName: "FIRST_GAME_TROPHY" },
  FIRST_WIN: { key: 'FIRST_WIN', displayName: 'ACH_FIRST_WIN_TITLE', description: 'ACH_FIRST_WIN_DESC', iconName: "FIRST_WIN_TROPHY" },
  DRAW_GAME: { key: 'DRAW_GAME', displayName: 'ACH_DRAW_GAME_TITLE', description: 'ACH_DRAW_GAME_DESC', iconName: "DRAW_GAME_TROPHY" },
  LOSE_BY_TIME: { key: 'LOSE_BY_TIME', displayName: 'ACH_LOSE_BY_TIME_TITLE', description: 'ACH_LOSE_BY_TIME_DESC', iconName: "LOSE_BY_TIME_TROPHY" },
  WIN_5: { key: 'WIN_5', displayName: 'ACH_WIN_5_TITLE', description: 'ACH_WIN_10_DESC', iconName: "WIN_5_TROPHY" },
  WIN_10: { key: 'WIN_10', displayName: 'ACH_WIN_10_TITLE', description: 'ACH_WIN_10_DESC', iconName: "WIN_10_TROPHY" },
  WIN_50: { key: 'WIN_50', displayName: 'ACH_WIN_50_TITLE', description: 'ACH_WIN_50_DESC', iconName: "WIN_50_TROPHY" },
  GET_ALL: { key: 'GET_ALL', displayName: 'ACH_GET_ALL_TITLE', description: 'ACH_GET_ALL_DESC', iconName: "GET_ALL_TROPHY" },

} as const;
