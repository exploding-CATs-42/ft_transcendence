// Project level
import {
  getSuccessRate,
  LeaderboardEntry,
  ProfileUserWithStats,
} from "@exploding-cats/contracts";
import { prisma, publicProfileSelect } from "lib/prisma";
import { toProfileUser, toProfileUserWithStats } from "mappers";
import { UserGameHistoryItem } from "../../../packages/contracts/src/shared/users";
import { ApiError } from "errors";

export class UsersServiceError extends ApiError {
  constructor(message: string, statusCode = 400) {
    super(message, statusCode);
  }
}

export async function getFinishedGamesStats(userId: string): Promise<{
  totalGames: number;
  wins: number;
}> {
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

  return {
    totalGames,
    wins,
  };
}

export async function getPublicUserById(
  userId: string,
): Promise<ProfileUserWithStats> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });

  if (!user) {
    throw new UsersServiceError("User not found", 404);
  }

  const stats = await getFinishedGamesStats(user.id);
  return toProfileUserWithStats(user, stats);
}

export async function ensureUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, avatarUrl: true },
  });

  if (!user) {
    throw new UsersServiceError("User not found", 404);
  }
  return user;
}

export async function searchUsersByUsername(
  username: string,
): Promise<ProfileUserWithStats[]> {
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
      return toProfileUserWithStats(user, stats);
    }),
  );
}

function compareLeaderboardEntries(
  left: ProfileUserWithStats,
  right: ProfileUserWithStats,
): number {
  if (left.wins !== right.wins) {
    return right.wins - left.wins;
  }

  const successRateDifference = getSuccessRate(right) - getSuccessRate(left);

  if (successRateDifference !== 0) {
    return successRateDifference;
  }

  if (left.totalGames !== right.totalGames) {
    return right.totalGames - left.totalGames;
  }

  return left.username.localeCompare(right.username);
}

/**
 * Returns every registered user with their finished-game statistics,
 * ordered from the strongest player to the weakest one.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [users, playedGroups, winGroups] = await Promise.all([
    prisma.user.findMany({
      select: publicProfileSelect,
    }),
    prisma.userGame.groupBy({
      by: ["userId"],
      where: {
        game: {
          endedAt: {
            not: null,
          },
        },
      },
      _count: { _all: true },
    }),
    prisma.game.groupBy({
      by: ["winnerUserId"],
      where: {
        winnerUserId: {
          not: null,
        },
        endedAt: {
          not: null,
        },
      },
      _count: { _all: true },
    }),
  ]);

  const totalGamesByUserId = new Map(
    playedGroups.map((group) => [group.userId, group._count._all]),
  );
  const winsByUserId = new Map(
    winGroups.map((group) => [group.winnerUserId, group._count._all]),
  );

  return users
    .map((user) =>
      toProfileUserWithStats(user, {
        totalGames: totalGamesByUserId.get(user.id) ?? 0,
        wins: winsByUserId.get(user.id) ?? 0,
      }),
    )
    .sort(compareLeaderboardEntries)
    .map((user, index) => ({ ...user, rank: index + 1 }));
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
      winnerId: membership.game.winnerUserId,
      players: membership.game.memberships.map((gameMembership) =>
        toProfileUser(gameMembership.user),
      ),
    }))
    .sort((left, right) => {
      return right.endedAt.getTime() - left.endedAt.getTime();
    });
}
