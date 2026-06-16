// Project level
import {
  Result,
  success,
  failure,
  JoinGameError,
  GameNotFoundError,
  PlayerHasActiveGameError,
  LeaveGameError,
  ConfirmStartError,
  CancelStartError,
} from "errors";
import { GameEvents, toWaitingPlayerView } from "game";
import { JoinGameResult, UserId } from "types";
import { PlayerIdPayload } from "@exploding-cats/shared-types";
import { getGameContext } from "game/utils";
import { createPlayer } from "game/factories";
import { attachBroadcasters } from "sockets";
import { GameRepository, toGameRecord } from "data";
import { Game, GameConfig, GameId, GameRecord } from "data/types";

export async function getAllGames(): Promise<GameRecord[]> {
  const games = GameRepository.getAllGames();
  return games.map((game) => toGameRecord(game));
}

export function getGameById(gameId: GameId): Result<Game, GameNotFoundError> {
  const game = GameRepository.getGame(gameId);
  if (!game) return failure({ reason: "GAME_NOT_FOUND" });

  return success(game);
}

export function getCurrentGame(
  userId: UserId,
): Result<GameRecord, GameNotFoundError> {
  const game = GameRepository.findCurrentGameByUserId(userId);
  if (!game) return failure({ reason: "GAME_NOT_FOUND" });

  return success(toGameRecord(game));
}

export function createGame(
  userId: UserId,
  config: GameConfig,
): Result<GameRecord, PlayerHasActiveGameError> {
  const result = getCurrentGame(userId);
  const alreadyInGame = result.ok;
  if (alreadyInGame) {
    const game = result.value;
    return failure({
      reason: "PLAYER_HAS_ACTIVE_GAME",
      existingGameId: game.id,
    });
  }

  const game = GameRepository.createGame({
    name: config.name,
    maxPlayers: config.maxPlayers,
  });

  attachBroadcasters(game);
  game.instance.start();

  joinGame(userId, game.id);

  return success(toGameRecord(game));
}

export function deleteGameById(
  gameId: GameId,
): Result<void, GameNotFoundError> {
  const deleted = GameRepository.deleteGameById(gameId);

  if (!deleted) {
    return failure({ reason: "GAME_NOT_FOUND" });
  }

  return success();
}

export function joinGame(
  userId: UserId,
  gameId: GameId,
): Result<JoinGameResult, JoinGameError> {
  const curGameSearchResult = getCurrentGame(userId);

  const alreadyInGame = curGameSearchResult.ok;
  if (alreadyInGame) {
    const game = curGameSearchResult.value;
    if (game.id === gameId) {
      return failure({ reason: "PLAYER_ALREADY_IN_GAME" });
    }

    return failure({
      reason: "PLAYER_HAS_ACTIVE_GAME",
      existingGameId: game.id,
    });
  }

  const gameSeachResult = getGameById(gameId);
  if (!gameSeachResult.ok) return gameSeachResult;

  const game = gameSeachResult.value;

  const players = getGameContext(game.instance).players;
  if (players.length >= game.maxPlayers) {
    return failure({ reason: "GAME_FULL", maxPlayers: game.maxPlayers });
  }

  const player = createPlayer(userId);
  game.instance.send({
    type: GameEvents.JOIN_GAME,
    player,
  });

  return success({
    player: toWaitingPlayerView(player),
    waitingState: { players: players.map(toWaitingPlayerView) },
  });
}

export function leaveGame(
  userId: UserId,
  gameId: GameId,
): Result<PlayerIdPayload, LeaveGameError> {
  const result = getGameById(gameId);
  if (!result.ok) return result;

  const game = result.value;
  const players = getGameContext(game.instance).players;

  const player = players.find((player) => {
    return player.id === userId;
  });

  if (!player) return failure({ reason: "PLAYER_IS_NOT_IN_GAME" });

  game.instance.send({
    type: GameEvents.LEAVE_GAME,
    playerId: player.id,
  });

  const noPlayersLeft = getGameContext(game.instance).players.length === 0;
  if (noPlayersLeft) GameRepository.deleteGameById(gameId);

  return success({ playerId: player.id });
}

export function confirmStart(
  userId: UserId,
  gameId: GameId,
): Result<PlayerIdPayload, ConfirmStartError> {
  const result = getGameById(gameId);
  if (!result.ok) return failure({ reason: "GAME_NOT_FOUND" });

  const game = result.value;
  const players = getGameContext(game.instance).players;

  const player = players.find((player) => {
    return player.id === userId;
  });

  if (!player) return failure({ reason: "PLAYER_IS_NOT_IN_GAME" });

  game.instance.send({
    type: GameEvents.CONFIRM_START,
    playerId: player.id,
  });

  return success({ playerId: player.id });
}

export function cancelStart(
  userId: UserId,
  gameId: GameId,
): Result<PlayerIdPayload, CancelStartError> {
  const result = getGameById(gameId);
  if (!result.ok) return failure({ reason: "GAME_NOT_FOUND" });

  const game = result.value;
  const players = getGameContext(game.instance).players;

  const player = players.find((player) => {
    return player.id === userId;
  });

  if (!player) return failure({ reason: "PLAYER_IS_NOT_IN_GAME" });

  game.instance.send({
    type: GameEvents.CANCEL_START,
    playerId: player.id,
  });

  return success({ playerId: player.id });
}
