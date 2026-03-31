import { GameStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.gameMove.deleteMany();
  await prisma.gamePlayer.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      username: "alice",
      passwordHash: "test_hash_alice"
    }
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      username: "bob",
      passwordHash: "test_hash_bob"
    }
  });

  const charlie = await prisma.user.create({
    data: {
      email: "charlie@example.com",
      username: "charlie",
      passwordHash: "test_hash_charlie"
    }
  });

  const diana = await prisma.user.create({
    data: {
      email: "diana@example.com",
      username: "diana",
      passwordHash: "test_hash_diana"
    }
  });

  await prisma.userSession.create({
    data: {
      userId: alice.id,
      tokenHash: "session_hash_alice_1",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    }
  });

  const game = await prisma.game.create({
    data: {
      status: GameStatus.IN_PROGRESS,
      createdById: alice.id,
      minPlayers: 2,
      maxPlayers: 4,
      startedAt: new Date()
    }
  });

  const gamePlayerAlice = await prisma.gamePlayer.create({
    data: {
      gameId: game.id,
      userId: alice.id,
      seatOrder: 1,
      isAlive: true,
      isWinner: false
    }
  });

  const gamePlayerBob = await prisma.gamePlayer.create({
    data: {
      gameId: game.id,
      userId: bob.id,
      seatOrder: 2,
      isAlive: true,
      isWinner: false
    }
  });

  const gamePlayerCharlie = await prisma.gamePlayer.create({
    data: {
      gameId: game.id,
      userId: charlie.id,
      seatOrder: 3,
      isAlive: true,
      isWinner: false
    }
  });

  const gamePlayerDiana = await prisma.gamePlayer.create({
    data: {
      gameId: game.id,
      userId: diana.id,
      seatOrder: 4,
      isAlive: true,
      isWinner: false
    }
  });

  await prisma.gameMove.create({
    data: {
      gameId: game.id,
      actorPlayerId: gamePlayerAlice.id,
      sequenceNumber: 1,
      moveType: "PLAY_CARD",
      payloadJson: {
        card: "SEE_THE_FUTURE",
        target: null,
        note: "Alice checks the top cards"
      }
    }
  });

  await prisma.gameMove.create({
    data: {
      gameId: game.id,
      actorPlayerId: gamePlayerBob.id,
      sequenceNumber: 2,
      moveType: "DRAW_CARD",
      payloadJson: {
        card: "SKIP",
        exploded: false
      }
    }
  });

  await prisma.gameMove.create({
    data: {
      gameId: game.id,
      actorPlayerId: gamePlayerCharlie.id,
      sequenceNumber: 3,
      moveType: "PLAY_CARD",
      payloadJson: {
        card: "ATTACK",
        targetSeatOrder: 4,
        stackedTurns: 2
      }
    }
  });

  console.log("Seed complete.");
  console.log({
    users: [alice.username, bob.username, charlie.username, diana.username],
    gameId: game.id,
    playerIds: [
      gamePlayerAlice.id,
      gamePlayerBob.id,
      gamePlayerCharlie.id,
      gamePlayerDiana.id
    ]
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });