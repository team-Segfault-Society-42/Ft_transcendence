export interface Match {
    id: number
    date: string
    result: "DRAW" | "WIN" | "LOSS"
    myScore: number
    oppScore: number
    opponent: {
      username: string
      avatar: string
    }
  }