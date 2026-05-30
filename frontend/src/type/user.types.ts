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

/**
 * Message payload received from the chat socket.
 */
export type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  user: UserChat;
};
