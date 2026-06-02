import { prisma } from "../lib/prisma";
import type { PublicProfileUser, UserGameHistoryItem } from "../types/auth";
import {
  ensureUserExists,
  publicProfileSelect,
  toFriendUser,
  toPublicProfileUser,
} from "../utils/users";

export class UsersServiceError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
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

  return Promise.all(users.map(toPublicProfileUser));
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
