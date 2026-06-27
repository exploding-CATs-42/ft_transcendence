export type UserId = string;

export interface GameStats {
  totalGames: number;
  wins: number;
}

export interface OnlineStatus {
  isOnline: boolean;
  lastSeenAt: Date | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export type PublicUser = Omit<User, "email">;

export type ProfileUser = PublicUser & OnlineStatus;
export type ProfileUserWithStats = ProfileUser & GameStats;

export type MyProfileUser = User & OnlineStatus;
export type MyProfileUserWithStats = MyProfileUser & GameStats;

export type FriendUser = ProfileUser;

export interface UserGameHistoryItem {
  gameId: string;
  gameName: string;
  endedAt: Date;
  winnerId: string | null;
  players: FriendUser[];
}
