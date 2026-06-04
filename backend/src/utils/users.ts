import { Prisma } from "../generated/prisma/client";
import { FriendUser, SelfProfileUser } from "../types/auth";

export const publicProfileSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  isOnline: true,
  lastSeenAt: true,
} satisfies Prisma.UserSelect;

export const selfProfileSelect = {
  id: true,
  email: true,
  username: true,
  avatarUrl: true,
  isOnline: true,
  lastSeenAt: true,
} satisfies Prisma.UserSelect;

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
