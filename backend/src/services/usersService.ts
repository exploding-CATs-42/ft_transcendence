import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";
import type {
  PublicProfileUser,
  UserGameHistoryItem,
  UserStats,
} from "../types/auth";

export class UsersServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

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

export function toPublicProfileUser(user: {
  id: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}): PublicProfileUser {
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
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
    lastSeenAt: user.lastSeenAt,
  };
}

async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new UsersServiceError("User not found", 404);
  }
}

export async function getPublicUserById(
  userId: string
): Promise<PublicProfileUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });

  if (!user) {
    throw new UsersServiceError("User not found", 404);
  }

  return toPublicProfileUser(user);
}

export async function searchUsersByUsername(
  username: string
): Promise<PublicProfileUser[]> {
  const users = await prisma.user.findMany({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: publicProfileSelect,
    orderBy: {
      username: "asc",
    },
  });

  return users.map(toPublicProfileUser);
}

export async function getUserStats(userId: string): Promise<UserStats> {
  await ensureUserExists(userId);

  const [totalGames, wins] = await Promise.all([
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

  const losses = totalGames - wins;
  const winRate =
    totalGames === 0 ? 0 : Math.round((wins / totalGames) * 100);

  return {
    totalGames,
    wins,
    losses,
    winRate,
  };
}

export async function getUserGames(
  userId: string
): Promise<UserGameHistoryItem[]> {
  await ensureUserExists(userId);

  const memberships = await prisma.userGame.findMany({
    where: { userId },
    include: {
      game: {
        select: {
          id: true,
          createdAt: true,
          startedAt: true,
          endedAt: true,
          winnerUserId: true,
          memberships: {
            include: {
              user: {
                select: publicProfileSelect,
              },
            },
          },
        },
      },
    },
  });

  return memberships
    .map((membership) => ({
      gameId: membership.game.id,
      createdAt: membership.game.createdAt,
      startedAt: membership.game.startedAt,
      endedAt: membership.game.endedAt,
      winnerUserId: membership.game.winnerUserId,
      isWinner: membership.game.winnerUserId === userId,
      players: membership.game.memberships.map((gameMembership) =>
        toPublicProfileUser(gameMembership.user)
      ),
    }))
    .sort((left, right) => {
      return right.createdAt.getTime() - left.createdAt.getTime();
    });
}