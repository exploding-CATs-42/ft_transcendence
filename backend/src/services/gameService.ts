import { ApiError } from "../errors/apiError";
import { SocketError } from "../errors/socketError";

import {
  CreateGameRequestBody,
  DeleteGameParams,
  GetGameByIdParams,
  JoinGameParams,
  LeaveGameParams,
} from "../schemas/games";

import { createActor } from "xstate";
import { GameEventType } from "../game/events";
import { gameMachine } from "../game/gameMachine";
import { Game, GameInfo, Player } from "../game/types";
import { UserId, WaitingStateView } from "../types";
import GameStore from "../utils/gameStore";
import { ensureUserExists } from "../utils/users";
import { toWaitingPlayerView } from '../game/mappers';

function ensureGameExists(gameId: string) {
  const game = GameStore.getGame(gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  return game;
}

export async function getGames(userId: UserId): Promise<Game[]> {
  await ensureUserExists(userId);

  return GameStore.getAllGames();
}

export async function getGameById(
  userId: UserId,
  input: GetGameByIdParams,
): Promise<Game> {
  await ensureUserExists(userId);

  return ensureGameExists(input.gameId);
}

export async function createGame(
  userId: UserId,
  input: CreateGameRequestBody,
): Promise<GameInfo> {
  await ensureUserExists(userId);

  const actor = createActor(gameMachine);

  const game: Game = {
    info: {
      id: crypto.randomUUID(),
      name: input.gameName,
      maxPlayers: input.maxPlayers,
      createdAt: Date.now(),
    },
    actor,
  };
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
  userId: string,
): Promise<WaitingStateView> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const playersBeforeJoin = game.actor.getSnapshot().context.players;

  if (playersBeforeJoin.length >= game.info.maxPlayers) {
    throw new SocketError("Game is full");
  }

  const alreadyJoined = playersBeforeJoin.some((p) => {
    return p.id === user.id;
  });

  if (alreadyJoined) {
    throw new SocketError("Player is already in game");
  }

  const player: Player = {
    id: user.id,
    name: user.username,
    hand: [],
    isAlive: true,
    turnOrder: 0,
  };

  game.actor.send({
    type: GameEventType.JOIN_GAME,
    player,
  });

  const playersAfterJoin = game.actor.getSnapshot().context.players;
  return { players: playersAfterJoin.map(toWaitingPlayerView) };
}

export async function leaveGame(
  input: LeaveGameParams,
  userId: string,
): Promise<string> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const { players } = game.actor.getSnapshot().context;

  const player = players.find((player) => {
    return player.id === user.id;
  });

  if (!player) {
    throw new SocketError("Player is not in the game");
  }

  const isLastPlayer = players.length === 1;

  game.actor.send({
    type: GameEventType.LEAVE_GAME,
    playerId: player.id,
  });

  if (isLastPlayer) {
    GameStore.deleteGameById(input.gameId);
    return (
      `Player ${user.username} [${user.id}] left the game ${game.info.name} [${game.info.id}].\n` +
      `Game is empty, removing.`
    );
  }

  return `Player ${user.username}[${user.id}] left the game ${game.info.name} [${game.info.id}].`;
}
