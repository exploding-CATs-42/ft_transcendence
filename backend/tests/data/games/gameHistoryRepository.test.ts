import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  gameUpsert: vi.fn(),
  gameUpdateMany: vi.fn(),
  userGameCreateMany: vi.fn(),
}));

vi.mock("lib/prisma", () => ({
  prisma: {
    $transaction: prismaMocks.transaction,
    game: {
      upsert: prismaMocks.gameUpsert,
      updateMany: prismaMocks.gameUpdateMany,
    },
    userGame: { createMany: prismaMocks.userGameCreateMany },
  },
}));

import {
  persistFinishedGame,
  persistStartedGame,
} from "data/games/gameHistoryRepository";

const game = {
  id: "4cce3d3e-3597-42b1-b251-61f803e3e18b",
  name: "Test game",
  createdAt: Date.parse("2026-07-31T10:00:00.000Z"),
};

describe("gameHistoryRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.gameUpsert.mockReturnValue("game-operation");
    prismaMocks.gameUpdateMany.mockReturnValue("game-update-operation");
    prismaMocks.userGameCreateMany.mockReturnValue("memberships-operation");
    prismaMocks.transaction.mockResolvedValue([]);
  });

  it("persists a started game with unique player memberships", async () => {
    const startedAt = new Date("2026-07-31T10:05:00.000Z");

    await persistStartedGame(
      game,
      ["player-1", "player-2", "player-1"],
      startedAt,
    );

    expect(prismaMocks.gameUpsert).toHaveBeenCalledWith({
      where: { id: game.id },
      create: {
        id: game.id,
        gameName: game.name,
        createdAt: new Date(game.createdAt),
        startedAt,
      },
      update: {},
    });
    expect(prismaMocks.userGameCreateMany).toHaveBeenCalledWith({
      data: [
        { gameId: game.id, userId: "player-1" },
        { gameId: game.id, userId: "player-2" },
      ],
      skipDuplicates: true,
    });
    expect(prismaMocks.transaction).toHaveBeenCalledWith([
      "game-operation",
      "memberships-operation",
    ]);
  });

  it("persists a finished game and includes the winner in memberships", async () => {
    const endedAt = new Date("2026-07-31T10:30:00.000Z");

    await persistFinishedGame(game, "winner", ["winner", "player-2"], endedAt);

    expect(prismaMocks.gameUpsert).toHaveBeenCalledWith({
      where: { id: game.id },
      create: {
        id: game.id,
        gameName: game.name,
        winnerUserId: "winner",
        createdAt: new Date(game.createdAt),
        endedAt,
      },
      update: {},
    });
    expect(prismaMocks.gameUpdateMany).toHaveBeenCalledWith({
      where: {
        id: game.id,
        endedAt: null,
      },
      data: {
        winnerUserId: "winner",
        endedAt,
      },
    });
    expect(prismaMocks.userGameCreateMany).toHaveBeenCalledWith({
      data: [
        { gameId: game.id, userId: "winner" },
        { gameId: game.id, userId: "player-2" },
      ],
      skipDuplicates: true,
    });
  });

  it("uses upsert and duplicate-safe memberships when finish is retried", async () => {
    const endedAt = new Date("2026-07-31T10:30:00.000Z");

    await persistFinishedGame(game, "winner", ["winner"], endedAt);
    await persistFinishedGame(game, "winner", ["winner"], endedAt);

    expect(prismaMocks.gameUpsert).toHaveBeenCalledTimes(2);
    expect(prismaMocks.gameUpsert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { id: game.id } }),
    );
    expect(prismaMocks.userGameCreateMany).toHaveBeenCalledTimes(2);
    expect(prismaMocks.userGameCreateMany).toHaveBeenNthCalledWith(2, {
      data: [{ gameId: game.id, userId: "winner" }],
      skipDuplicates: true,
    });
    expect(prismaMocks.gameUpdateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: game.id,
        endedAt: null,
      },
      data: {
        winnerUserId: "winner",
        endedAt,
      },
    });
  });
});
