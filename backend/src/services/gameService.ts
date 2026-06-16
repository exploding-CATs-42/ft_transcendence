// Libraries
import { createActor } from "xstate";
// Project level
import { ApiError, SocketError } from "errors";
import {
  CancelStartParams,
  ConfirmStartParams,
  CreateGameRequestBody,
  DeleteGameParams,
  GetGameByIdParams,
  JoinGameParams,
  LeaveGameParams,
} from "schemas";
import {
  GameEvents,
  gameMachine,
  GameInstance,
  GameInfo,
  toWaitingPlayerView,
  attachBroadcaster,
} from "game";
import { Player } from "game/types";
import { JoinGameResult, UserId } from "types";
import { PlayerIdPayload } from "@exploding-cats/shared-types";
import { GameStore } from "utils";
// Local level
import { ensureUserExists } from "./usersService";

function ensureGameExists(gameId: string) {
  const game = GameStore.getGame(gameId);

  if (!game) {
    throw new ApiError("GameInstance not found", 404);
  }

  return game;
}

export async function getGames(userId: UserId): Promise<GameInfo[]> {
  await ensureUserExists(userId);

  return GameStore.getAllGames().map((game) => {
    return game.info;
  });
}

export async function getGameById(
  userId: UserId,
  input: GetGameByIdParams,
): Promise<GameInstance> {
  await ensureUserExists(userId);

  return ensureGameExists(input.gameId);
}

export async function getCurrentGame(userId: UserId): Promise<GameInfo | null> {
  await ensureUserExists(userId);

  const currentGame = GameStore.findCurrentGameByUserId(userId);

  if (!currentGame) {
    return null;
  }

  return currentGame.info;
}

export async function createGame(
  userId: UserId,
  input: CreateGameRequestBody,
): Promise<GameInfo> {
  const user = await ensureUserExists(userId);

  const currentGame = GameStore.findCurrentGameByUserId(userId);

  if (currentGame) {
    throw new ApiError("Player already has an active or waiting game", 409, {
      existingGameId: currentGame.info.id,
    });
  }

  const actor = createActor(gameMachine);

  const game: GameInstance = {
    info: {
      id: crypto.randomUUID(),
      name: input.gameName,
      maxPlayers: input.maxPlayers,
      createdAt: Date.now(),
    },
    actor,
  };

  attachBroadcaster(game.info.id, actor);
  actor.start();

  const player: Player = {
    id: user.id,
    name: user.username,
    hand: [],
    isConfirmed: false,
    isAlive: true,
    turnOrder: 0,
  };

  game.actor.send({
    type: GameEvents.JOIN_GAME,
    player,
  });

  GameStore.setGame(game);
  return game.info;
}

export async function deleteGame(userId: UserId, input: DeleteGameParams) {
  await ensureUserExists(userId);
  ensureGameExists(input.gameId);

  GameStore.deleteGameById(input.gameId);
}

export async function joinGame(
  input: JoinGameParams,
  userId: UserId,
): Promise<JoinGameResult> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const playersBefore = game.actor.getSnapshot().context.players;

  const alreadyJoined = playersBefore.some((p) => {
    return p.id === user.id;
  });

  if (alreadyJoined) {
    const player = playersBefore.find((p) => {
      return p.id === user.id;
    });

    return {
      player: toWaitingPlayerView(player!),
      waitingState: { players: playersBefore.map(toWaitingPlayerView) },
    };
  }

  const currentGame = GameStore.findCurrentGameByUserId(userId);

  if (currentGame && currentGame.info.id !== input.gameId) {
    throw new SocketError("Player already has an active or waiting game", {
      existingGameId: currentGame.info.id,
    });
  }

  if (playersBefore.length >= game.info.maxPlayers) {
    throw new SocketError("GameInstance is full");
  }

  const player: Player = {
    id: user.id,
    name: user.username,
    hand: [],
    isConfirmed: false,
    isAlive: true,
    turnOrder: 0,
  };

  game.actor.send({
    type: GameEvents.JOIN_GAME,
    player,
  });

  const playersAfter = game.actor.getSnapshot().context.players;

  return {
    player: toWaitingPlayerView(player),
    waitingState: { players: playersAfter.map(toWaitingPlayerView) },
  };
}

export async function leaveGame(
  input: LeaveGameParams,
  userId: UserId,
): Promise<PlayerIdPayload> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const playersBefore = game.actor.getSnapshot().context.players;

  const player = playersBefore.find((player) => {
    return player.id === user.id;
  });

  if (!player) {
    throw new SocketError("Player is not in the game");
  }

  const isLastPlayer = playersBefore.length === 1;

  game.actor.send({
    type: GameEvents.LEAVE_GAME,
    playerId: player.id,
  });

  if (isLastPlayer) {
    GameStore.deleteGameById(input.gameId);
    return { playerId: "" };
  }

  return { playerId: player.id };
}

export async function confirmStart(
  input: ConfirmStartParams,
  userId: UserId,
): Promise<PlayerIdPayload> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const playersBefore = game.actor.getSnapshot().context.players;

  const player = playersBefore.find((player) => {
    return player.id === user.id;
  });

  if (!player) {
    throw new SocketError("Player is not in the game");
  }

  game.actor.send({
    type: GameEvents.CONFIRM_START,
    playerId: player.id,
  });

  return { playerId: player.id };
}

export async function cancelStart(
  input: CancelStartParams,
  userId: UserId,
): Promise<PlayerIdPayload> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const playersBefore = game.actor.getSnapshot().context.players;

  const player = playersBefore.find((player) => {
    return player.id === user.id;
  });

  if (!player) {
    throw new SocketError("Player is not in the game");
  }

  game.actor.send({
    type: GameEvents.CANCEL_START,
    playerId: player.id,
  });

  return { playerId: player.id };
}
