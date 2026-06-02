import { Request } from "express";

export interface PublicUser {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}

export interface ProfileUser {
  id: string;
  username: string;
  isOnline: boolean;
  avatarUrl: string | null;
  lastSeenAt: Date | null;
}

export interface UserStats {
  totalMatches: number;
  wins: number;
}

export interface PublicProfileUser extends ProfileUser, UserStats {}

export interface SelfProfileUser extends ProfileUser {
  email: string;
}

export interface MeUser extends SelfProfileUser, UserStats {}

export interface FriendUser extends ProfileUser {}

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

export interface RegisterResponse {
  user: PublicUser;
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
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}
