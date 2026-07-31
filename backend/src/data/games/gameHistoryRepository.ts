import { prisma } from "lib/prisma";
import type { GameMetadata } from "./types";

type GameHistoryMetadata = Pick<GameMetadata, "id" | "name" | "createdAt">;

const toMemberships = (gameId: string, playerIds: string[]) => {
  return [...new Set(playerIds)].map((userId) => ({ gameId, userId }));
};

export async function persistStartedGame(
  game: GameHistoryMetadata,
  playerIds: string[],
  startedAt = new Date(),
) {
  const memberships = toMemberships(game.id, playerIds);

  await prisma.$transaction([
    prisma.game.upsert({
      where: { id: game.id },
      create: {
        id: game.id,
        gameName: game.name,
        createdAt: new Date(game.createdAt),
        startedAt,
      },
      update: {},
    }),
    prisma.userGame.createMany({
      data: memberships,
      skipDuplicates: true,
    }),
  ]);
}

export async function persistFinishedGame(
  game: GameHistoryMetadata,
  winnerUserId: string,
  playerIds: string[],
  endedAt = new Date(),
) {
  const memberships = toMemberships(game.id, [winnerUserId, ...playerIds]);

  await prisma.$transaction([
    prisma.game.upsert({
      where: { id: game.id },
      create: {
        id: game.id,
        gameName: game.name,
        winnerUserId,
        createdAt: new Date(game.createdAt),
        endedAt,
      },
      update: {},
    }),
    prisma.game.updateMany({
      where: {
        id: game.id,
        endedAt: null,
      },
      data: {
        winnerUserId,
        endedAt,
      },
    }),
    prisma.userGame.createMany({
      data: memberships,
      skipDuplicates: true,
    }),
  ]);
}
