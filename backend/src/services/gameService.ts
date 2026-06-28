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
import { GameEvents, Player } from "@exploding-cats/game-core";
import { Game, GameRecord } from "data/types";
import { JoinGameResult, UserId } from "types";
import { PlayerIdPayload } from "@exploding-cats/contracts";
import { GameRepository, toGameRecord } from "data";
import { attachGameBroadcaster } from "sockets";
import { toWaitingPlayerView } from "mappers";
// Local level
import { ensureUserExists } from "./usersService";

function ensureGameExists(gameId: string) {
  const game = GameRepository.getGame(gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  return game;
}

export async function getGames(userId: UserId): Promise<GameRecord[]> {
  await ensureUserExists(userId);

  return GameRepository.getAllGames().map((game) => {
    return toGameRecord(game);
  });
}

export async function getGameById(
  userId: UserId,
  input: GetGameByIdParams,
): Promise<Game> {
  await ensureUserExists(userId);

  return ensureGameExists(input.gameId);
}

export async function getCurrentGame(
  userId: UserId,
): Promise<GameRecord | null> {
  await ensureUserExists(userId);

  const currentGame = GameRepository.findCurrentGameByUserId(userId);

  if (!currentGame) {
    return null;
  }

  return toGameRecord(currentGame);
}

export async function createGame(
  userId: UserId,
  input: CreateGameRequestBody,
): Promise<GameRecord> {
  const user = await ensureUserExists(userId);

  const currentGame = GameRepository.findCurrentGameByUserId(userId);

  if (currentGame) {
    throw new ApiError("Player already has an active or waiting game", 409, {
      existingGameId: currentGame.id,
    });
  }

  const game = GameRepository.createGame(input.gameName, input.maxPlayers);
  attachGameBroadcaster(game);
  game.instance.start();

  const player: Player = {
    id: user.id,
    name: user.username,
    avatarUrl: user.avatarUrl,
    hand: [],
    isConfirmed: false,
    isAlive: true,
    turnOrder: 0,
  };

  game.instance.send({
    type: GameEvents.JOIN_GAME,
    player,
  });

  return toGameRecord(game);
}

export async function deleteGame(userId: UserId, input: DeleteGameParams) {
  await ensureUserExists(userId);
  ensureGameExists(input.gameId);

  GameRepository.deleteGameById(input.gameId);
}

export async function joinGame(
  input: JoinGameParams,
  userId: UserId,
): Promise<JoinGameResult> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const playersBefore = game.instance.getSnapshot().context.players;

  const alreadyJoined = playersBefore.some((p) => {
    return p.id === user.id;
  });

  if (alreadyJoined) {
    const player = playersBefore.find((p) => {
      return p.id === user.id;
    });

    const filteredPlayers = playersBefore.filter((p) => p.id !== player?.id);

    return {
      player: toWaitingPlayerView(player!),
      waitingState: { players: filteredPlayers.map(toWaitingPlayerView) },
    };
  }

  const currentGame = GameRepository.findCurrentGameByUserId(userId);

  if (currentGame && currentGame.id !== input.gameId) {
    throw new SocketError("Player already has an active or waiting game", {
      existingGameId: currentGame.id,
    });
  }

  if (playersBefore.length >= game.maxPlayers) {
    throw new SocketError("Game is full");
  }

  const player: Player = {
    id: user.id,
    name: user.username,
    avatarUrl: user.avatarUrl,
    hand: [],
    isConfirmed: false,
    isAlive: true,
    turnOrder: 0,
  };

  game.instance.send({
    type: GameEvents.JOIN_GAME,
    player,
  });

  return {
    player: toWaitingPlayerView(player),
    waitingState: { players: playersBefore.map(toWaitingPlayerView) },
  };
}

export async function leaveGame(
  input: LeaveGameParams,
  userId: UserId,
): Promise<PlayerIdPayload> {
  const user = await ensureUserExists(userId);

  const game = ensureGameExists(input.gameId);
  const playersBefore = game.instance.getSnapshot().context.players;

  const player = playersBefore.find((player) => {
    return player.id === user.id;
  });

  if (!player) {
    throw new SocketError("Player is not in the game");
  }

  const isLastPlayer = playersBefore.length === 1;

  game.instance.send({
    type: GameEvents.LEAVE_GAME,
    playerId: player.id,
  });

  if (isLastPlayer) {
    GameRepository.deleteGameById(input.gameId);
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
  const playersBefore = game.instance.getSnapshot().context.players;

  const player = playersBefore.find((player) => {
    return player.id === user.id;
  });

  if (!player) {
    throw new SocketError("Player is not in the game");
  }

  game.instance.send({
    type: GameEvents.CONFIRM_READINESS,
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
  const playersBefore = game.instance.getSnapshot().context.players;

  const player = playersBefore.find((player) => {
    return player.id === user.id;
  });

  if (!player) {
    throw new SocketError("Player is not in the game");
  }

  game.instance.send({
    type: GameEvents.CANCEL_START,
    playerId: player.id,
  });

  return { playerId: player.id };
}
