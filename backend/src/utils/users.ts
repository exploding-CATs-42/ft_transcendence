import { FriendUser, SelfProfileUser } from "../types/auth";

export function toFriendUser(user: {
  id: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}): FriendUser {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
    lastSeenAt: user.lastSeenAt,
  };
}

export function toSelfProfileUser(user: {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}): SelfProfileUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
    lastSeenAt: user.lastSeenAt,
  };
}

export function toPublicProfileUser(
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: Date | null;
  },
  stats: {
    totalMatches: number;
    wins: number;
  },
) {
  return {
    ...user,
    totalMatches: stats.totalMatches,
    wins: stats.wins,
  };
}

export function toMeUser(
  user: SelfProfileUser,
  stats: {
    totalMatches: number;
    wins: number;
  },
) {
  return {
    ...user,
    totalMatches: stats.totalMatches,
    wins: stats.wins,
  };
}
