import type { GameContext } from "./gameMachine";
import { type GameEvent, GameEvents } from "./events";
import { createDeck, dealInitialCards, shuffle, drawOneCard } from "./utils";
import { START_GAME_COUNTDOWN_MS } from "./constants";

export const GameActions = {
  ADD_PLAYER: "addPlayer",
  REMOVE_PLAYER: "removePlayer",
  ADD_PLAYER_CONFIRMATION: "addPlayerConfirmation",
  REMOVE_PLAYER_CONFIRMATION: "removePlayerConfirmation",
  FILL_DECK: "fillDeck",
  DEAL_CARDS: "dealCards",
  SHUFFLE_PLAYERS: "shufflePlayers",
  CHANGE_TURN: "changeTurn",
  DRAW_CARD: "drawCard",
  PLAY_CARD: "playCard",
  SET_COUNTDOWN_ENDS_AT: "setCountdownEndsAt",
  CLEAR_COUNTDOWN_ENDS_AT: "clearCountdownEndsAt",
} as const;

export interface GameActionArgs {
  context: GameContext;
  event: GameEvent;
}

export const addPlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.JOIN_GAME) return context;

  return {
    players: [...context.players, event.player],
  };
};

export const removePlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.LEAVE_GAME) return context;

  const leavingPlayerIndex = context.players.findIndex(
    (player) => player.id === event.playerId,
  );

  if (leavingPlayerIndex === -1) return context;

  const players = context.players.filter((p) => p.id !== event.playerId);

  if (context.currentTurnPlayerId !== event.playerId) {
    return { players };
  }

  for (let i = 0; i < players.length; ++i) {
    const nextPlayer = players[(leavingPlayerIndex + i) % players.length]!;

    if (nextPlayer.isAlive) {
      return { players, currentTurnPlayerId: nextPlayer.id };
    }
  }

  return {
    players,
    currentTurnPlayerId: null,
  };
};

export const addPlayerConfirmation = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.CONFIRM_START) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isConfirmed: true } : p,
    ),
  };
};

export const removePlayerConfirmation = ({
  context,
  event,
}: GameActionArgs) => {
  if (event.type !== GameEvents.CANCEL_START) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isConfirmed: false } : p,
    ),
  };
};

export const setCountdownEndsAt = () => ({
  countdownEndsAt: Date.now() + START_GAME_COUNTDOWN_MS,
});

export const clearCountdownEndsAt = () => ({
  countdownEndsAt: null,
});

export const fillDeck = () => {
  const deck = createDeck();
  return { deck };
};

export const dealCards = ({ context }: GameActionArgs) => {
  const players = context.players.map((player) => ({
    ...player,
    hand: [...player.hand],
  }));

  const newDeck = dealInitialCards(context.deck, players);

  return {
    deck: newDeck,
    players,
  };
};

export const shufflePlayers = ({ context }: GameActionArgs) => {
  const players = context.players.slice();

  shuffle(players);

  return { players };
};

export const changeTurn = ({ context }: GameActionArgs) => {
  const { players, currentTurnPlayerId } = context;

  /*
    On the first turn, currentTurnPlayerId is null, so findIndex() returns -1.
    Starting the loop at i = 1 makes (-1 + 1) % players.length === 0,
    so the first player in the array gets the first turn.
  */
  const currentPlayerIndex = players.findIndex(
    (player) => player.id === currentTurnPlayerId,
  );

  // Return next alive player
  for (let i = 1; i <= players.length; ++i) {
    const nextPlayer = players[(currentPlayerIndex + i) % players.length]!;

    if (nextPlayer.isAlive) {
      return { currentTurnPlayerId: nextPlayer.id };
    }
  }

  return context;
};

export const drawCard = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.DRAW_CARD) return context;

  const deck = context.deck;

  const lastDrawnCard = drawOneCard(deck);

  if (!lastDrawnCard) return context;

  const updatedPlayers = context.players.map((player) =>
    player.id === event.playerId
      ? {
          ...player,
          hand: [...player.hand, lastDrawnCard],
        }
      : player,
  );

  return {
    deck,
    players: updatedPlayers,
    lastDrawnCard,
    turnsCount: context.turnsCount - 1,
  };
};

export const playCard = ({ context, event }: GameActionArgs) => {
  if (event.type != GameEvents.PLAY_CARD) return context;

  const { playerId, card } = event;
  const players = context.players;

  const player = players.find((player) => player.id === playerId);
  if (!player) return context;

  const hand = player.hand;

  const cardIndex = hand.findIndex((c) => c.id === card.id);
  if (cardIndex === -1) {
    return {
      lastPlayedCard: null,
    };
  }

  const playedCard = hand[cardIndex];
  const updatedHand = hand.filter((_, i) => i !== cardIndex);

  const updatedPlayers = players.map((player) =>
    player.id === playerId ? { ...player, hand: updatedHand } : player,
  );

  return {
    players: updatedPlayers,
    lastPlayedCard: playedCard!,
  };
};
