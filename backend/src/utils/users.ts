import { ApiError } from "../errors/apiError";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { FriendUser, PublicProfileUser, SelfProfileUser } from "../types/auth";

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

async function getFinishedGamesStats(userId: string): Promise<{
  totalMatches: number;
  wins: number;
}> {
  const [totalMatches, wins] = await Promise.all([
    prisma.userGame.count({
      where: {
        userId,
        game: {
          endedAt: {
            not: null,
          },
        },
      },
    }),
    prisma.game.count({
      where: {
        winnerUserId: userId,
        endedAt: {
          not: null,
        },
      },
    }),
  ]);

  return {
    totalMatches,
    wins,
  };
}

export async function toPublicProfileUser(user: {
  id: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}): Promise<PublicProfileUser> {
  const stats = await getFinishedGamesStats(user.id);

  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
    lastSeenAt: user.lastSeenAt,
    totalMatches: stats.totalMatches,
    wins: stats.wins,
  };
}

export async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return user;
}
