// Project level
import { ApiError, SocketError } from "errors";
import {
  CancelStartParams,
  ConfirmStartParams,
  CreateGameRequestBody,
  DeleteGameParams,
  DrawCardParams,
  GetGameParams,
  JoinGameParams,
  LeaveGameParams,
  ReconnectGameParams,
} from "schemas";
import {
  Card,
  GameEvents,
  GameStates,
  Player,
} from "@exploding-cats/game-core";
import {
  GameStatePayload,
  PlayerIdPayload,
  SocketErrorCodes,
  UserId,
} from "@exploding-cats/contracts";
import { Game, GameId, GameRecord } from "data/types";
import { JoinGameResult } from "types";
import { GameRepository, toGameRecord } from "data";
import { attachGameBroadcaster } from "sockets";
import { toPublicPlayerView, toWaitingPlayerView } from "mappers";
// Local level
import { ensureUserExists } from "./usersService";
import { PLayCardParams } from "schemas/games/playCardSchema";

function ensureGameExists(gameId: string) {
  const game = GameRepository.getGame(gameId);

  if (!game) {
    throw new ApiError("Game not found", 404);
  }

  return game;
}

function isGameInProgress(game: Game): boolean {
  return game.instance.getSnapshot().matches(GameStates.PLAYING);
}

function orderPlayersForPlayer(players: Player[], playerId: UserId): Player[] {
  const playerIndex = players.findIndex((player) => player.id === playerId);

  if (playerIndex === -1) return players;

  return [...players.slice(playerIndex), ...players.slice(0, playerIndex)];
}

async function getGameContext(userId: UserId, gameId: GameId) {
  const user = await ensureUserExists(userId);
  const game = GameRepository.getGame(gameId);

  if (!game) {
    throw new SocketError("Game not found", {
      code: SocketErrorCodes.GAME_NOT_FOUND,
    });
  }

  const players = game.instance.getSnapshot().context.players;

  const player = players.find((p) => p.id === user.id);

  return { user, game, players, player };
}

async function requirePlayerInGame(userId: UserId, gameId: GameId) {
  const context = await getGameContext(userId, gameId);

  if (!context.player) {
    throw new SocketError("Player is not in the game");
  }

  return {
    ...context,
    player: context.player,
  };
}

export async function getGames(userId: UserId): Promise<GameRecord[]> {
  await ensureUserExists(userId);

  return GameRepository.getAllGames().map((game) => {
    return toGameRecord(game);
  });
}

export async function getGameById(
  userId: UserId,
  input: GetGameParams,
): Promise<GameRecord> {
  await ensureUserExists(userId);

  return toGameRecord(ensureGameExists(input.gameId));
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
  const {
    user,
    game,
    players: playersBefore,
    player,
  } = await getGameContext(userId, input.gameId);

  if (player) {
    if (isGameInProgress(game)) {
      // My game is mid-play: the client must use RECONNECT_GAME
      // to get the game state instead of the waiting room.
      throw new SocketError("Reconnect required", {
        code: SocketErrorCodes.RECONNECT_REQUIRED,
      });
    }

    const filteredPlayers = playersBefore.filter((p) => p.id !== player.id);

    return {
      player: toWaitingPlayerView(player),
      waitingState: { players: filteredPlayers.map(toWaitingPlayerView) },
      countdownEndsAt: game.instance.getSnapshot().context.countdownEndsAt,
    };
  }

  if (isGameInProgress(game)) {
    throw new SocketError("Game is already in progress", {
      code: SocketErrorCodes.GAME_IN_PROGRESS,
    });
  }

  const currentGame = GameRepository.findCurrentGameByUserId(userId);

  if (currentGame && currentGame.id !== input.gameId) {
    throw new SocketError("Player already has an active or waiting game", {
      code: SocketErrorCodes.ALREADY_IN_OTHER_GAME,
      errors: { existingGameId: currentGame.id },
    });
  }

  if (playersBefore.length >= game.maxPlayers) {
    throw new SocketError("Game is full", {
      code: SocketErrorCodes.GAME_FULL,
    });
  }

  const newPlayer: Player = {
    id: user.id,
    name: user.username,
    avatarUrl: user.avatarUrl,
    hand: [],
    isConfirmed: false,
    isAlive: true,
  };

  game.instance.send({
    type: GameEvents.JOIN_GAME,
    player: newPlayer,
  });

  return {
    player: toWaitingPlayerView(newPlayer),
    waitingState: { players: playersBefore.map(toWaitingPlayerView) },
    countdownEndsAt: game.instance.getSnapshot().context.countdownEndsAt,
  };
}

export async function reconnectGame(
  input: ReconnectGameParams,
  userId: UserId,
): Promise<GameStatePayload> {
  const { game, players, player } = await requirePlayerInGame(
    userId,
    input.gameId,
  );

  if (!isGameInProgress(game)) {
    throw new SocketError("Game is not in progress");
  }

  const orderedPlayers = orderPlayersForPlayer(players, player.id);
  const context = game.instance.getSnapshot().context;

  const gameContext = game.instance.getSnapshot().context;
  return {
    players: orderedPlayers.map(toPublicPlayerView),
    hand: player.hand,
    currentTurnPlayerId: gameContext.currentTurnPlayerId,
    deckSize: gameContext.deck.length,
    lastPlayedCard: context.lastPlayedCard,
  };
}

export async function leaveGame(
  input: LeaveGameParams,
  userId: UserId,
): Promise<PlayerIdPayload> {
  const {
    game,
    players: playersBefore,
    player,
  } = await requirePlayerInGame(userId, input.gameId);

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
  const { game, player } = await requirePlayerInGame(userId, input.gameId);

  game.instance.send({
    type: GameEvents.CONFIRM_START,
    playerId: player.id,
  });

  return { playerId: player.id };
}

export async function cancelStart(
  input: CancelStartParams,
  userId: UserId,
): Promise<PlayerIdPayload> {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);

  game.instance.send({
    type: GameEvents.CANCEL_START,
    playerId: player.id,
  });

  return { playerId: player.id };
}

export async function drawCard(input: DrawCardParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);

  game.instance.send({
    type: GameEvents.DRAW_CARD,
    playerId: player.id,
  });

  const lastDrawnCard = game.instance.getSnapshot().context.lastDrawnCard;
  if (!lastDrawnCard) {
    throw new SocketError("Could not draw card");
  }

  return { playerId: player.id, card: lastDrawnCard };
}

function getPlayableCard(player: Player, cardId: number): Card {
  const card = player.hand.find((c) => c.id === cardId);
  if (!card) throw new SocketError("Card is not in your hand");
  if (!card.playable) throw new SocketError("Card cannot be played");
  return card;
}

export async function playCard(input: PLayCardParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  const card = getPlayableCard(player, input.cardId);

  game.instance.send({
    type: GameEvents.PLAY_CARD,
    playerId: player.id,
    card,
  });

  return { playerId: player.id, card };
}
