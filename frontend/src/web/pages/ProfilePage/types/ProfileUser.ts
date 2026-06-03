export type UserId = string;

export interface ProfileUser {
  id: UserId;
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
