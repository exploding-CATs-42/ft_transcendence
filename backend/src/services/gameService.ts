// Project level
import { ApiError, SocketError } from "errors";
import {
  CancelStartParams,
  ConfirmStartParams,
  CreateGameRequestBody,
  DeleteGameParams,
  DrawCardParams,
  GetGameParams,
  InsertKittenParams,
  GiveCardPayload,
  JoinGameParams,
  LeaveGameParams,
  PlayCardParams,
  PlayComboParams,
  PlayDefuseParams,
  PlayNopeParams,
  ReconnectGameParams,
  SeenTheFuturePayload,
  ResolveComboParams,
  SelectComboTargetParams,
} from "schemas";
import {
  type Card,
  CardType,
  GameContext,
  GameEvents,
  GameInstance,
  GameStates,
  type Player,
} from "@exploding-cats/game-core";
import {
  GameStatePayload,
  PlayerIdPayload,
  SocketErrorCodes,
  UserId,
} from "@exploding-cats/contracts";
import { Game, GameId, GameRecord } from "data/types";
import { JoinGameResult } from "types";
import {
  attachGameHistoryPersistence,
  GameRepository,
  toGameRecord,
} from "data";
import {
  attachAutoPlay,
  attachGameBroadcaster,
  attachGameCleanup,
} from "sockets";
import { toPublicPlayerView, toWaitingPlayerView } from "mappers";
// Local level
import { ensureUserExists } from "./usersService";
import { SelectPlayerPayload } from "schemas/games/selectPlayerSchema";

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

function buildJoinResult(
  game: Game,
  player: Player,
  isNewPlayer: boolean,
): JoinGameResult {
  const { players, countdownEndsAt } = game.instance.getSnapshot().context;

  return {
    waitingState: { players: players.map(toWaitingPlayerView) },
    player: toWaitingPlayerView(player),
    isNewPlayer,
    countdownEndsAt,
  };
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

function ensurePlayersTurn(context: GameContext, player: Player) {
  if (context.currentTurnPlayerId !== player.id) {
    throw new SocketError("Not your turn", {
      code: SocketErrorCodes.NOT_YOUR_TURN,
    });
  }
}

function getComboCards(player: Player, cardIds: number[]) {
  const uniqueCardIds = new Set(cardIds);
  if (uniqueCardIds.size !== cardIds.length) {
    throw new SocketError("Combo cards must be unique");
  }

  const cards = cardIds.map((cardId) =>
    player.hand.find((card) => card.id === cardId),
  );

  if (cards.some((card) => !card)) {
    throw new SocketError("Combo cards must be in your hand");
  }

  const comboCards = cards as Card[];
  const comboCardType = comboCards[0]!.type;
  if (comboCards.some((card) => card.type !== comboCardType)) {
    throw new SocketError("Combo cards must have the same type");
  }
  if (!comboCards.every((card) => card.comboEligible)) {
    throw new SocketError("These cards cannot be played as a combo");
  }

  return comboCards;
}

function getMachineState(gameInstance: GameInstance): GameStates | null {
  const state = gameInstance.getSnapshot();

  if (state.matches({ [GameStates.PLAYING]: GameStates.SELECTING_PLAYER })) {
    return GameStates.SELECTING_PLAYER;
  } else if (
    state.matches({
      [GameStates.PLAYING]: GameStates.WAITING_FOR_FAVOR_CARD_SELECTION,
    })
  ) {
    return GameStates.WAITING_FOR_FAVOR_CARD_SELECTION;
  } else if (
    state.matches({
      [GameStates.PLAYING]: GameStates.WAITING_FOR_KITTEN_INSERTION,
    })
  ) {
    return GameStates.WAITING_FOR_KITTEN_INSERTION;
  } else if (
    state.matches({
      [GameStates.PLAYING]: GameStates.WAITING_FOR_DEFUSE_CARD,
    })
  ) {
    return GameStates.WAITING_FOR_DEFUSE_CARD;
  } else if (
    state.matches({
      [GameStates.PLAYING]: GameStates.PLAYER_LOOKS_AT_THE_FUTURE,
    })
  ) {
    return GameStates.PLAYER_LOOKS_AT_THE_FUTURE;
  }

  return null;
}

export async function getGames(userId: UserId): Promise<GameRecord[]> {
  await ensureUserExists(userId);

  return GameRepository.getAllGames()
    .filter((game) => game.instance.getSnapshot().matches(GameStates.WAITING))
    .map(toGameRecord);
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
  attachAutoPlay(game);
  attachGameHistoryPersistence(game);
  attachGameCleanup(game);
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

    return buildJoinResult(game, player, false);
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

  return buildJoinResult(game, newPlayer, true);
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
  const snapshot = game.instance.getSnapshot();
  const context = snapshot.context;
  const machineState = getMachineState(game.instance);

  let topCards = null;
  if (
    machineState === GameStates.PLAYER_LOOKS_AT_THE_FUTURE &&
    userId === context.currentTurnPlayerId
  ) {
    topCards = context.deck.slice(0, 3);
  }

  const isWaitingForThisPlayersCombo =
    snapshot.matches({
      [GameStates.PLAYING]: GameStates.WAITING_FOR_COMBO_SELECTION,
    }) && context.pendingCombo?.playerId === player.id;

  return {
    players: orderedPlayers.map(toPublicPlayerView),
    hand: player.hand,
    currentTurnPlayerId: context.currentTurnPlayerId,
    deckSize: context.deck.length,
    lastPlayedCards: context.lastPlayedCards,
    attackCount: context.turnsCount,
    selectedPlayerId: context.selectedPlayerId,
    countdownEndsAt: context.countdownEndsAt,
    topCards,
    machineState,
    pendingComboSize: isWaitingForThisPlayersCombo
      ? context.pendingCombo!.comboSize
      : null,
    pendingComboTargetPlayerId: isWaitingForThisPlayersCombo
      ? (context.pendingCombo!.targetPlayerId ?? null)
      : null,
    pendingComboRequestedCardType: isWaitingForThisPlayersCombo
      ? (context.pendingCombo!.requestedCardType ?? null)
      : null,
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

  const gameSnapshot = game.instance.getSnapshot();
  ensurePlayersTurn(gameSnapshot.context, player);

  if (
    !gameSnapshot.matches({
      [GameStates.PLAYING]: GameStates.WAITING_FOR_PLAYER_ACTIONS,
    })
  ) {
    throw new SocketError("Could not draw card now");
  }

  const deckSizeBefore = gameSnapshot.context.deck.length;

  game.instance.send({
    type: GameEvents.DRAW_CARD,
    playerId: player.id,
  });

  const { lastDrawnCard, deck } = game.instance.getSnapshot().context;
  const deskSizeAfter = deck.length;

  if (!lastDrawnCard || deckSizeBefore === deskSizeAfter) {
    throw new SocketError("Could not draw card");
  }

  return { playerId: player.id, card: lastDrawnCard };
}

export async function selectPlayer(input: SelectPlayerPayload, userId: UserId) {
  const { game } = await requirePlayerInGame(userId, input.gameId);
  await requirePlayerInGame(input.playerId, input.gameId);

  game.instance.send({
    type: GameEvents.SELECT_PLAYER,
    playerId: input.playerId,
  });

  return { playerId: input.playerId };
}

export async function giveCard(input: GiveCardPayload, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  await requirePlayerInGame(input.playerIdTo, input.gameId);

  const card = player.hand.find((c) => c.id === input.cardId);
  if (!card) throw new SocketError("Card is not in your hand");

  game.instance.send({
    type: GameEvents.PASS_CARD_BY_ID,
    ...input,
  });

  return { card };
}

function getPlayableCard(player: Player, cardId: number): Card {
  const card = player.hand.find((c) => c.id === cardId);
  if (!card) throw new SocketError("Card is not in your hand");
  if (!card.playable) throw new SocketError("Card cannot be played");
  return card;
}

export async function playCard(input: PlayCardParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  ensurePlayersTurn(game.instance.getSnapshot().context, player);

  const card = getPlayableCard(player, input.cardId);

  game.instance.send({
    type: GameEvents.PLAY_CARD,
    playerId: player.id,
    card,
  });

  const { lastPlayedCards, nopeWindow } = game.instance.getSnapshot().context;
  const lastPlayedCard = lastPlayedCards?.[0];
  if (
    lastPlayedCards?.length !== 1 ||
    lastPlayedCard?.id !== card.id ||
    !nopeWindow
  ) {
    throw new SocketError("Could not play card");
  }

  return {
    playerId: player.id,
    card,
    nopeWindowExpiresAt: nopeWindow.endsAt,
  };
}

function getNopeCard(player: Player, cardId: number): Card {
  const card = player.hand.find((c) => c.id === cardId);

  if (!card) throw new SocketError("Card is not in your hand");

  if (card.type !== CardType.NOPE) throw new SocketError("Card is not a Nope");

  return card;
}

export async function playNope(input: PlayNopeParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  const card = getNopeCard(player, input.cardId);

  game.instance.send({
    type: GameEvents.PLAY_NOPE,
    playerId: player.id,
    card,
  });

  const { lastPlayedCards, nopeWindow } = game.instance.getSnapshot().context;
  const lastPlayedCard = lastPlayedCards?.[0];

  if (lastPlayedCard?.id !== card.id || !nopeWindow) {
    throw new SocketError("Could not play nope");
  }

  return {
    playerId: player.id,
    card: lastPlayedCard,
    nopeWindowExpiresAt: nopeWindow.endsAt,
  };
}

export async function playCombo(input: PlayComboParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  const context = game.instance.getSnapshot().context;
  ensurePlayersTurn(context, player);

  const hasEligibleTarget = context.players.some(
    (candidate) =>
      candidate.id !== player.id &&
      candidate.isAlive &&
      candidate.hand.length > 0,
  );
  if (!hasEligibleTarget) {
    throw new SocketError("No opponent has a card to steal");
  }

  const cards = getComboCards(player, input.cardIds);

  game.instance.send({
    type: GameEvents.PLAY_COMBO,
    playerId: player.id,
    cardIds: cards.map((card) => card.id),
  });

  const { lastPlayedCards, pendingCombo } = game.instance.getSnapshot().context;
  const lastPlayedCardIds = new Set(lastPlayedCards?.map((card) => card.id));

  if (
    !lastPlayedCards ||
    lastPlayedCards.length !== cards.length ||
    cards.some((card) => !lastPlayedCardIds.has(card.id)) ||
    !pendingCombo ||
    pendingCombo.playerId !== player.id
  ) {
    throw new SocketError("Could not play combo");
  }

  return {
    playerId: player.id,
    cards: lastPlayedCards,
  };
}

export async function resolveCombo(input: ResolveComboParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  const beforeContext = game.instance.getSnapshot().context;
  const pendingCombo = beforeContext.pendingCombo;

  if (!pendingCombo || pendingCombo.playerId !== player.id) {
    throw new SocketError("No combo is waiting for your selection");
  }

  const targetPlayer = beforeContext.players.find(
    (candidate) => candidate.id === input.targetPlayerId,
  );
  if (
    !targetPlayer ||
    targetPlayer.id === player.id ||
    !targetPlayer.isAlive ||
    (!pendingCombo.targetPlayerId && targetPlayer.hand.length === 0)
  ) {
    throw new SocketError("Choose a living opponent who has cards");
  }

  if (!pendingCombo.targetPlayerId) {
    if (
      (pendingCombo.comboSize === 2 &&
        (input.cardIndex !== undefined ||
          input.requestedCardType !== undefined)) ||
      (pendingCombo.comboSize === 3 &&
        (input.cardIndex !== undefined ||
          input.requestedCardType === undefined))
    ) {
      throw new SocketError("Invalid declaration for this combo");
    }

    game.instance.send({
      type: GameEvents.RESOLVE_COMBO,
      playerId: player.id,
      targetPlayerId: targetPlayer.id,
      ...(input.requestedCardType
        ? { requestedCardType: input.requestedCardType }
        : {}),
    });

    const declaredContext = game.instance.getSnapshot().context;
    if (
      declaredContext.pendingCombo?.targetPlayerId !== targetPlayer.id ||
      !declaredContext.nopeWindow ||
      !declaredContext.lastPlayedCards
    ) {
      throw new SocketError("Could not declare combo");
    }

    return {
      status: "declared" as const,
      playerId: player.id,
      cards: declaredContext.lastPlayedCards,
      nopeWindowExpiresAt: declaredContext.nopeWindow.endsAt,
    };
  }

  if (input.targetPlayerId !== pendingCombo.targetPlayerId) {
    throw new SocketError(
      "Combo target cannot be changed after the Nope window",
    );
  }

  if (
    (pendingCombo.comboSize === 2 &&
      (input.cardIndex === undefined ||
        input.requestedCardType !== undefined)) ||
    (pendingCombo.comboSize === 3 &&
      (input.cardIndex !== undefined ||
        input.requestedCardType !== pendingCombo.requestedCardType))
  ) {
    throw new SocketError("Invalid selection for this combo");
  }

  const card =
    pendingCombo.comboSize === 2
      ? targetPlayer.hand[input.cardIndex!]
      : targetPlayer.hand.find(
          (candidate) => candidate.type === input.requestedCardType,
        );

  if (pendingCombo.comboSize === 2 && !card) {
    throw new SocketError("Selected card does not exist");
  }

  const comboSelectionEvent =
    pendingCombo.comboSize === 2
      ? {
          type: GameEvents.RESOLVE_COMBO,
          playerId: player.id,
          targetPlayerId: targetPlayer.id,
          cardIndex: input.cardIndex!,
        }
      : {
          type: GameEvents.RESOLVE_COMBO,
          playerId: player.id,
          targetPlayerId: targetPlayer.id,
          requestedCardType: input.requestedCardType!,
        };
  game.instance.send(comboSelectionEvent);

  const afterContext = game.instance.getSnapshot().context;
  if (afterContext.pendingCombo !== null) {
    throw new SocketError("Could not resolve combo");
  }

  if (card) {
    const updatedPlayer = afterContext.players.find(
      (candidate) => candidate.id === player.id,
    );
    const updatedTarget = afterContext.players.find(
      (candidate) => candidate.id === targetPlayer.id,
    );
    const wasTransferred =
      updatedPlayer?.hand.some((candidate) => candidate.id === card.id) &&
      !updatedTarget?.hand.some((candidate) => candidate.id === card.id);

    if (!wasTransferred) {
      throw new SocketError("Could not transfer selected card");
    }
  }

  return {
    status: "resolved" as const,
    playerId: player.id,
    targetPlayerId: targetPlayer.id,
    comboSize: pendingCombo.comboSize,
    requestedCardType: input.requestedCardType,
    card: card ?? null,
  };
}

export async function playDefuse(input: PlayDefuseParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  ensurePlayersTurn(game.instance.getSnapshot().context, player);

  const defuseBefore = player.hand.find(
    (card) => card.type === CardType.DEFUSE,
  );

  game.instance.send({
    type: GameEvents.PLAY_DEFUSE,
    playerId: player.id,
  });

  // The machine immutably rebuilds the players array, so re-read the player to
  // learn whether the defuse card was actually consumed by the transition.
  const updatedPlayer = game.instance
    .getSnapshot()
    .context.players.find((p) => p.id === player.id);

  const defuseConsumed =
    defuseBefore !== undefined &&
    !updatedPlayer?.hand.some((card) => card.id === defuseBefore.id);

  const card = defuseConsumed ? defuseBefore : null;
  if (!card) {
    throw new SocketError("Could not play defuse");
  }

  return { playerId: player.id, card };
}

export async function insertKitten(input: InsertKittenParams, userId: UserId) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);

  const beforeContext = game.instance.getSnapshot().context;
  ensurePlayersTurn(beforeContext, player);

  const card = beforeContext.lastDrawnCard;
  if (!card || card.type !== CardType.EXPLODING_KITTEN) {
    throw new SocketError("No exploding kitten to insert");
  }
  const deckSizeBefore = beforeContext.deck.length;

  game.instance.send({
    type: GameEvents.INSERT_KITTEN,
    explodingKittenPosition: input.explodingKittenPosition,
  });

  const afterContext = game.instance.getSnapshot().context;
  const updatedPlayer = afterContext.players.find((p) => p.id === player.id);

  const wasRemovedFromHand =
    updatedPlayer !== undefined &&
    !updatedPlayer.hand.some((c) => c.id === card.id);

  const wasInsertedIntoDeck = afterContext.deck.length === deckSizeBefore + 1;
  if (!wasRemovedFromHand || !wasInsertedIntoDeck) {
    throw new SocketError("Could not insert exploding kitten");
  }

  return { playerId: player.id, card };
}

export async function confirmPlayerSeenTheCards(
  input: SeenTheFuturePayload,
  userId: UserId,
) {
  const { game } = await requirePlayerInGame(userId, input.gameId);
  game.instance.send({ type: GameEvents.SEEN_THE_FUTURE });
}

export async function selectComboTarget(
  input: SelectComboTargetParams,
  userId: UserId,
) {
  const { game, player } = await requirePlayerInGame(userId, input.gameId);
  const context = game.instance.getSnapshot().context;
  const pendingCombo = context.pendingCombo;

  if (
    !pendingCombo ||
    pendingCombo.playerId !== player.id ||
    context.currentTurnPlayerId !== player.id
  ) {
    throw new SocketError("No combo is waiting for your selection");
  }

  const target = context.players.find(
    (candidate) => candidate.id === input.targetPlayerId,
  );

  if (
    !target ||
    target.id === player.id ||
    !target.isAlive ||
    target.hand.length === 0
  ) {
    throw new SocketError("Choose a living opponent who has cards");
  }

  return {
    playerId: player.id,
    targetPlayerId: target.id,
  };
}
