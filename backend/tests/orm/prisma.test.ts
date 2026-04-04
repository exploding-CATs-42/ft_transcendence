import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import {
  PrismaClient,
  FriendshipStatus,
} from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

describe("Prisma ORM smoke tests", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a user", async () => {
    const suffix = randomUUID();

    const user = await prisma.user.create({
      data: {
        email: `orm-user-${suffix}@example.com`,
        username: `orm_user_${suffix.replace(/-/g, "").slice(0, 12)}`,
        passwordHash: "hashed-password",
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toContain("@example.com");
  });

  it("rejects duplicate email", async () => {
    const suffix = randomUUID();
    const email = `duplicate-${suffix}@example.com`;

    await prisma.user.create({
      data: {
        email,
        username: `dup_a_${suffix.replace(/-/g, "").slice(0, 10)}`,
        passwordHash: "hashed-password",
      },
    });

    await expect(
      prisma.user.create({
        data: {
          email,
          username: `dup_b_${suffix.replace(/-/g, "").slice(0, 10)}`,
          passwordHash: "hashed-password",
        },
      }),
    ).rejects.toThrow();
  });

  it("creates friendship with canonical pair", async () => {
    const suffix = randomUUID().replace(/-/g, "");

    const userA = await prisma.user.create({
      data: {
        email: `friend-a-${suffix}@example.com`,
        username: `friend_a_${suffix.slice(0, 10)}`,
        passwordHash: "hashed-password",
      },
    });

    const userB = await prisma.user.create({
      data: {
        email: `friend-b-${suffix}@example.com`,
        username: `friend_b_${suffix.slice(0, 10)}`,
        passwordHash: "hashed-password",
      },
    });

    const low = userA.id < userB.id ? userA.id : userB.id;
    const high = userA.id < userB.id ? userB.id : userA.id;

    const friendship = await prisma.friendship.create({
      data: {
        userLowId: low,
        userHighId: high,
        requestedById: userA.id,
        status: FriendshipStatus.PENDING,
      },
    });

    expect(friendship.userLowId).toBe(low);
    expect(friendship.userHighId).toBe(high);
  });

  it("creates moves in a game", async () => {
    const suffix = randomUUID().replace(/-/g, "");

    const actor = await prisma.user.create({
      data: {
        email: `actor-${suffix}@example.com`,
        username: `actor_${suffix.slice(0, 10)}`,
        passwordHash: "hashed-password",
      },
    });

    const game = await prisma.game.create({
      data: {
        memberships: {
          create: [{ userId: actor.id }],
        },
      },
    });

    const move1 = await prisma.gameMove.create({
      data: {
        gameId: game.id,
        actorUserId: actor.id,
        type: "DRAW_CARD",
        payloadJson: { result: "SAFE_DRAW" },
      },
    });

    const move2 = await prisma.gameMove.create({
      data: {
        gameId: game.id,
        actorUserId: actor.id,
        type: "END_TURN",
        payloadJson: { nextPlayer: "someone" },
      },
    });

    const moves = await prisma.gameMove.findMany({
      where: { gameId: game.id },
    });

    expect(move1.id).toBeDefined();
    expect(move2.id).toBeDefined();
    expect(moves).toHaveLength(2);
  });

  it("links cards to a move", async () => {
    const suffix = randomUUID().replace(/-/g, "");

    const actor = await prisma.user.create({
      data: {
        email: `card-actor-${suffix}@example.com`,
        username: `card_actor_${suffix.slice(0, 10)}`,
        passwordHash: "hashed-password",
      },
    });

    const card = await prisma.card.upsert({
      where: { name: `Test Card ${suffix}` },
      update: {},
      create: {
        name: `Test Card ${suffix}`,
        type: "TEST",
        description: "Temporary test card",
      },
    });

    const game = await prisma.game.create({
      data: {
        memberships: {
          create: [{ userId: actor.id }],
        },
      },
    });

    const move = await prisma.gameMove.create({
      data: {
        gameId: game.id,
        actorUserId: actor.id,
        type: "PLAY_CARD",
        payloadJson: { action: "TEST_CARD" },
      },
    });

    const link = await prisma.moveCard.create({
      data: {
        moveId: move.id,
        cardId: card.id,
      },
    });

    expect(link.moveId).toBe(move.id);
    expect(link.cardId).toBe(card.id);
  });
});