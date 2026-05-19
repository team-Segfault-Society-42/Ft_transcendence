export interface User {
  id: number;
  email: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  wins: number;
  losses: number;
  draws: number;
  xp: number;
  isTwoFactorEnabled: boolean;
}

export type UserChat = {
  id: number;
  username: string;
  avatar: string | null;
};

export type ChatMessage = {
  id: number;
  content: string;
  createdAt: string;
  user: UserChat;
};
