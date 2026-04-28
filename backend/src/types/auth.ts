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
  totalMatches: number;
  wins: number;
}

export interface FriendUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}

export interface SelfProfileUser {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}

export type FriendDirection = "incoming" | "outgoing" | "accepted";

export interface FriendListItem {
  user: FriendUser;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  direction: FriendDirection;
}

export interface UserGameHistoryItem {
  gameId: string;
  gameName: string;
  endedAt: Date;
  isWinner: boolean;
  players: FriendUser[];
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthSessionResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshSessionResponse {
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
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}
