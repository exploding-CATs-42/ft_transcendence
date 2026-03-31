import { PrismaClient, Prisma, GameStatus } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

const prisma = new PrismaClient();

describe("Prisma integration", () => {
  beforeEach(async () => {
    await prisma.gameMove.deleteMany();
    await prisma.gamePlayer.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.game.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a user", async () => {
    const user = await prisma.user.create({
      data: {
        email: "test1@example.com",
        username: "test1",
        passwordHash: "hash_1"
      }
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test1@example.com");
    expect(user.username).toBe("test1");
  });

  it("enforces unique email", async () => {
    await prisma.user.create({
      data: {
        email: "duplicate@example.com",
        username: "user_one",
        passwordHash: "hash_1"
      }
    });

    await expect(
      prisma.user.create({
        data: {
          email: "duplicate@example.com",
          username: "user_two",
          passwordHash: "hash_2"
        }
      })
    ).rejects.toMatchObject({
      code: "P2002"
    } satisfies Partial<Prisma.PrismaClientKnownRequestError>);
  });

  it("creates a game with players", async () => {
    const owner = await prisma.user.create({
      data: {
        email: "owner@example.com",
        username: "owner",
        passwordHash: "owner_hash"
      }
    });

    const secondPlayer = await prisma.user.create({
      data: {
        email: "player2@example.com",
        username: "player2",
        passwordHash: "player2_hash"
      }
    });

    const game = await prisma.game.create({
      data: {
        status: GameStatus.WAITING,
        createdById: owner.id,
        minPlayers: 2,
        maxPlayers: 4
      }
    });

    const gp1 = await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId: owner.id,
        seatOrder: 1
      }
    });

    const gp2 = await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId: secondPlayer.id,
        seatOrder: 2
      }
    });

    expect(game.id).toBeDefined();
    expect(gp1.gameId).toBe(game.id);
    expect(gp2.gameId).toBe(game.id);
    expect(gp1.seatOrder).toBe(1);
    expect(gp2.seatOrder).toBe(2);
  });

  it("enforces unique seat order per game", async () => {
    const owner = await prisma.user.create({
      data: {
        email: "owner2@example.com",
        username: "owner2",
        passwordHash: "owner_hash"
      }
    });

    const anotherUser = await prisma.user.create({
      data: {
        email: "another@example.com",
        username: "another",
        passwordHash: "another_hash"
      }
    });

    const thirdUser = await prisma.user.create({
      data: {
        email: "third@example.com",
        username: "third",
        passwordHash: "third_hash"
      }
    });

    const game = await prisma.game.create({
      data: {
        status: GameStatus.WAITING,
        createdById: owner.id,
        minPlayers: 2,
        maxPlayers: 4
      }
    });

    await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId: anotherUser.id,
        seatOrder: 1
      }
    });

    await expect(
      prisma.gamePlayer.create({
        data: {
          gameId: game.id,
          userId: thirdUser.id,
          seatOrder: 1
        }
      })
    ).rejects.toMatchObject({
      code: "P2002"
    } satisfies Partial<Prisma.PrismaClientKnownRequestError>);
  });

  it("enforces unique sequence number inside a game", async () => {
    const owner = await prisma.user.create({
      data: {
        email: "moveowner@example.com",
        username: "moveowner",
        passwordHash: "owner_hash"
      }
    });

    const game = await prisma.game.create({
      data: {
        status: GameStatus.IN_PROGRESS,
        createdById: owner.id,
        minPlayers: 2,
        maxPlayers: 4
      }
    });

    const player = await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId: owner.id,
        seatOrder: 1
      }
    });

    await prisma.gameMove.create({
      data: {
        gameId: game.id,
        actorPlayerId: player.id,
        sequenceNumber: 1,
        moveType: "PLAY_CARD",
        payloadJson: {
          card: "SKIP"
        }
      }
    });

    await expect(
      prisma.gameMove.create({
        data: {
          gameId: game.id,
          actorPlayerId: player.id,
          sequenceNumber: 1,
          moveType: "DRAW_CARD",
          payloadJson: {
            exploded: false
          }
        }
      })
    ).rejects.toMatchObject({
      code: "P2002"
    } satisfies Partial<Prisma.PrismaClientKnownRequestError>);
  });
});