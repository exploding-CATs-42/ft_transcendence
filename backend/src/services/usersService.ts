import { prisma, publicProfileSelect } from "../lib/prisma";
import type { PublicProfileUser, UserGameHistoryItem } from "../types/auth";
import { toFriendUser, toPublicProfileUser } from "../utils/users";

export class UsersServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
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

export async function getPublicUserById(
  userId: string,
): Promise<PublicProfileUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });

  if (!user) {
    throw new UsersServiceError("User not found", 404);
  }

  const stats = await getFinishedGamesStats(user.id);
  return toPublicProfileUser(user, stats);
}

export async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!user) {
    throw new UsersServiceError("User not found", 404);
  }
  return user;
}

export async function searchUsersByUsername(
  username: string,
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

  return Promise.all(
    users.map(async (user) => {
      const stats = await getFinishedGamesStats(user.id);
      return toPublicProfileUser(user, stats);
    }),
  );
}

export async function getUserGames(
  userId: string,
): Promise<UserGameHistoryItem[]> {
  await ensureUserExists(userId);

  const memberships = await prisma.userGame.findMany({
    where: {
      userId,
      game: {
        endedAt: {
          not: null,
        },
      },
    },
    include: {
      game: {
        select: {
          id: true,
          gameName: true,
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
      gameName: membership.game.gameName,
      endedAt: membership.game.endedAt as Date,
      isWinner: membership.game.winnerUserId === userId,
      players: membership.game.memberships.map((gameMembership) =>
        toFriendUser(gameMembership.user),
      ),
    }))
    .sort((left, right) => {
      return right.endedAt.getTime() - left.endedAt.getTime();
    });
}
