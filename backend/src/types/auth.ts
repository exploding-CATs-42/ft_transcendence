export interface PublicUser {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export interface PublicProfileUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}

export interface SelfProfileUser extends PublicProfileUser {
  email: string;
}

export type FriendDirection = "incoming" | "outgoing" | "accepted";

export interface FriendListItem {
  user: PublicProfileUser;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  direction: FriendDirection;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface UserGameHistoryItem {
  gameId: string;
  createdAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
  winnerUserId: string | null;
  isWinner: boolean;
  players: PublicProfileUser[];
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  message: string;
}

export interface ValidationErrorResponse {
  message: string;
  errors: {
    formErrors: string[];
    fieldErrors: Record<string, string[]>;
  };
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  type: "access";
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}