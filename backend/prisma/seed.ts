import bcrypt from "bcrypt";
import {
  PrismaClient,
  FriendshipStatus,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed must not run in production");
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const cardsData = [
    {
      name: "Exploding Kitten",
      type: "EXPLODING_KITTEN",
      description: "You explode unless you use a Defuse.",
      imageUrl: null,
    },
    {
      name: "Defuse",
      type: "DEFUSE",
      description: "Prevents explosion and lets you put the kitten back.",
      imageUrl: null,
    },
    {
      name: "Attack",
      type: "ACTION",
      description: "Ends your turn and forces the next player to take 2 turns.",
      imageUrl: null,
    },
    {
      name: "Nope",
      type: "ACTION",
      description: "Cancels another action before it resolves.",
      imageUrl: null,
    },
    {
      name: "Skip",
      type: "ACTION",
      description: "Ends your turn without drawing.",
      imageUrl: null,
    },
    {
      name: "Shuffle",
      type: "ACTION",
      description: "Shuffles the draw pile.",
      imageUrl: null,
    },
    {
      name: "See the Future",
      type: "ACTION",
      description: "See the top 3 cards of the draw pile.",
      imageUrl: null,
    },
    {
      name: "Favor",
      type: "ACTION",
      description: "Target player gives you one card of their choice.",
      imageUrl: null,
    },
    {
      name: "Tacocat",
      type: "CAT",
      description: "Cat combo card.",
      imageUrl: null,
    },
    {
      name: "Cattermelon",
      type: "CAT",
      description: "Cat combo card.",
      imageUrl: null,
    },
  ];

  for (const card of cardsData) {
    await prisma.card.upsert({
      where: { name: card.name },
      update: {
        type: card.type,
        description: card.description,
        imageUrl: card.imageUrl,
      },
      create: card,
    });
  }

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      update: {
        username: "alice",
        passwordHash,
        isOnline: true,
        lastSeenAt: new Date(),
      },
      create: {
        email: "alice@example.com",
        username: "alice",
        passwordHash,
        isOnline: true,
        lastSeenAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      update: {
        username: "bob",
        passwordHash,
        isOnline: false,
        lastSeenAt: new Date(Date.now() - 1000 * 60 * 15),
      },
      create: {
        email: "bob@example.com",
        username: "bob",
        passwordHash,
        isOnline: false,
        lastSeenAt: new Date(Date.now() - 1000 * 60 * 15),
      },
    }),
    prisma.user.upsert({
      where: { email: "carol@example.com" },
      update: {
        username: "carol",
        passwordHash,
        isOnline: false,
        lastSeenAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      create: {
        email: "carol@example.com",
        username: "carol",
        passwordHash,
        isOnline: false,
        lastSeenAt: new Date(Date.now() - 1000 * 60 * 60),
      },
    }),
    prisma.user.upsert({
      where: { email: "dave@example.com" },
      update: {
        username: "dave",
        passwordHash,
        isOnline: false,
        lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      create: {
        email: "dave@example.com",
        username: "dave",
        passwordHash,
        isOnline: false,
        lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    }),
  ]);

  const [alice, bob, carol, dave] = users;

  const friendshipPairs = [
    {
      low: alice.id < bob.id ? alice.id : bob.id,
      high: alice.id < bob.id ? bob.id : alice.id,
      requestedById: alice.id,
      status: FriendshipStatus.ACCEPTED,
    },
    {
      low: carol.id < dave.id ? carol.id : dave.id,
      high: carol.id < dave.id ? dave.id : carol.id,
      requestedById: carol.id,
      status: FriendshipStatus.PENDING,
    },
    {
      low: alice.id < dave.id ? alice.id : dave.id,
      high: alice.id < dave.id ? dave.id : alice.id,
      requestedById: dave.id,
      status: FriendshipStatus.REJECTED,
    },
  ];

  for (const pair of friendshipPairs) {
    await prisma.friendship.upsert({
      where: {
        userLowId_userHighId: {
          userLowId: pair.low,
          userHighId: pair.high,
        },
      },
      update: {
        requestedById: pair.requestedById,
        status: pair.status,
      },
      create: {
        userLowId: pair.low,
        userHighId: pair.high,
        requestedById: pair.requestedById,
        status: pair.status,
      },
    });
  }

  await prisma.game.create({
    data: {
      gameName: "Friday Night Table",
      winnerUserId: alice.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      startedAt: new Date(Date.now() - 1000 * 60 * 55),
      endedAt: new Date(Date.now() - 1000 * 60 * 40),
      memberships: {
        create: [{ userId: alice.id }, { userId: dave.id }],
      },
    },
  });

  await prisma.game.create({
    data: {
      gameName: "Lunch Break Match",
      winnerUserId: bob.id,
      createdAt: new Date(Date.now() - 1000 * 60 * 180),
      startedAt: new Date(Date.now() - 1000 * 60 * 175),
      endedAt: new Date(Date.now() - 1000 * 60 * 160),
      memberships: {
        create: [
          { userId: alice.id },
          { userId: bob.id },
          { userId: carol.id },
        ],
      },
    },
  });

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });