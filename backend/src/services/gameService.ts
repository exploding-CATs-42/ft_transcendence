import { ApiError } from "../errors/apiError";
import { SocketError } from "../errors/socketError";

import {
  CancelStartParams,
  ConfirmStartParams,
  CreateGameRequestBody,
  DeleteGameParams,
  GetGameByIdParams,
  JoinGameParams,
  LeaveGameParams,
} from "../schemas/games";

import { createActor } from "xstate";
import { GameEventType } from "../game/events";
import { gameMachine } from "../game/gameMachine";
import { GameInstance, GameInfo } from "../game/types";
import { Player } from "../game/types/player";
import { JoinGameResult, PlayerIdPayload, UserId } from "../types";
import GameStore from "../utils/gameStore";
import { toWaitingPlayerView } from "../game/mappers";
import { attachBroadcaster } from "../game/broadcaster";
import { ensureUserExists } from "./usersService";

function ensureGameExists(gameId: string) {
  const game = GameStore.getGame(gameId);

  if (!game) {
    throw new ApiError("GameInstance not found", 404);
  }

  return game;
}

export async function getGames(userId: UserId): Promise<GameInstance[]> {
  await ensureUserExists(userId);

  return GameStore.getAllGames();
}

export async function getGameById(
  userId: UserId,
  input: GetGameByIdParams,
): Promise<GameInstance> {
  await ensureUserExists(userId);

  return ensureGameExists(input.gameId);
}

export async function createGame(
  userId: UserId,
  input: CreateGameRequestBody,
): Promise<GameInfo> {
  await ensureUserExists(userId);

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

  if (playersBefore.length >= game.info.maxPlayers) {
    throw new SocketError("GameInstance is full");
  }

  const alreadyJoined = playersBefore.some((p) => {
    return p.id === user.id;
  });

  if (alreadyJoined) {
    throw new SocketError("Player is already in game");
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
    type: GameEventType.JOIN_GAME,
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
    type: GameEventType.LEAVE_GAME,
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
    type: GameEventType.CONFIRM_START,
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
    type: GameEventType.CANCEL_START,
    playerId: player.id,
  });

  return { playerId: player.id };
}
