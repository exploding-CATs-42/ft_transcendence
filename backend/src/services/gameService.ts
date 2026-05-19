import { DEFAULT_GAME_STATE, DEFAULT_PLAYER } from "../constants/game";
import { ApiError } from "../errors/apiError";

import {
  CreateGameRequestBody,
  DeleteGameParams,
  GetGameByIdParams,
  JoinGameParams,
} from "../schemas/games";

import { GameState, Player, UserId } from "../types";
import GameStore from "../utils/gameStore";

import { ensureUserExists } from "../utils/users";

function ensureGameExists(gameId: string) {
  const game = GameStore.getGame(gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  return game;
}

export async function getGames(userId: UserId): Promise<GameState[]> {
  await ensureUserExists(userId);

  return GameStore.getAllGames();
}

export async function getGameById(
  userId: UserId,
  input: GetGameByIdParams,
): Promise<GameState> {
  await ensureUserExists(userId);

  return ensureGameExists(input.gameId);
}

export async function createGame(
  userId: UserId,
  input: CreateGameRequestBody,
): Promise<GameState> {
  await ensureUserExists(userId);

  const gameId = crypto.randomUUID();

  const game: GameState = {
    ...DEFAULT_GAME_STATE,
    gameId: gameId,
    players: [],
    name: input.gameName,
    maxPlayers: input.maxPlayers,
  };

  GameStore.setGame(game);
  return game;
}

export async function deleteGame(userId: UserId, input: DeleteGameParams) {
  await ensureUserExists(userId);
  ensureGameExists(input.gameId);

  GameStore.deleteGameById(input.gameId);
}

export async function joinGame(
  input: JoinGameParams,
  currentUserId: string,
): Promise<string> {
  const user = await ensureUserExists(currentUserId);

  const playerToJoin: Player = {
    ...DEFAULT_PLAYER,
    playerId: user.id,
    displayName: user.username,
  };

  const game = ensureGameExists(input.gameId);

  if (game.players.length >= game.maxPlayers) {
    throw new ApiError("Game is full", 409);
  }

  const alreadyJoined = game.players.some((p) => {
    return p.playerId == user.id;
  });

  if (alreadyJoined) {
    throw new ApiError("Player is already in game", 409);
  }

  game.players.push(playerToJoin);
  return `Player ${user.username} [${user.id}] joined the game ${game.name} [${game.gameId}].`;
}
