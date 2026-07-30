import type { GameContext } from "./gameMachine";
import { type GameEvent, GameEvents } from "./events";
import { createDeck, dealInitialCards, shuffle, drawOneCard } from "./utils";
import {
  START_GAME_COUNTDOWN_MS,
  WAIT_FOR_DEFUSE_TIMEOUT,
  NOPE_WINDOW_MS,
} from "./constants";
import {
  type Card,
  CardType,
  type NopeWindow,
  PendingActionType,
  PlayerStatus,
} from "./types";

export const GameActions = {
  ADD_PLAYER: "addPlayer",
  REMOVE_PLAYER: "removePlayer",
  MARK_PLAYER_AS_LEFT: "markPlayerAsLeft",
  ADD_PLAYER_CONFIRMATION: "addPlayerConfirmation",
  REMOVE_PLAYER_CONFIRMATION: "removePlayerConfirmation",
  FILL_DECK: "fillDeck",
  DEAL_CARDS: "dealCards",
  SHUFFLE_PLAYERS: "shufflePlayers",
  MARK_PLAYERS_AS_PLAYING: "markPlayersAsPlaying",
  CHANGE_TURN: "changeTurn",
  CHANGE_TURN_UNDER_ATTACK: "changeTurnUnderAttack",
  DRAW_CARD: "drawCard",
  PLAY_CARD: "playCard",
  SET_COUNTDOWN_ENDS_AT: "setCountdownEndsAt",
  SET_DEFUSE_COUNTDOWN_ENDS_AT: "setDefuseCountdownEndsAt",
  CLEAR_COUNTDOWN_ENDS_AT: "clearCountdownEndsAt",
  SHUFFLE_DECK: "shuffleDeck",
  SKIP_TURN: "skipTurn",
  PLAY_COMBO: "playCombo",
  DEFUSE_KITTEN: "defuseExplodingKitten",
  EXPLODE_PLAYER: "explodePlayer",
  INSERT_KITTEN: "insertKitten",
  SET_NOPE_WINDOW: "setNopeWindow",
  CLEAR_NOPE_WINDOW: "clearNopeWindow",
  ADD_NOPE: "addNope",
  SELECT_PLAYER: "selectPlayer",
  PASS_CARD_BY_ID: "passCardById",
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

export const markPlayerAsLeft = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.LEAVE_GAME) return context;

  const leavingPlayerIndex = context.players.findIndex(
    (player) => player.id === event.playerId,
  );

  if (leavingPlayerIndex === -1) return context;

  const players = context.players.map((p) =>
    p.id !== event.playerId ? p : { ...p, status: PlayerStatus.LEFT },
  );

  return { players };
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

export const setDefuseCountdownEndsAt = () => ({
  countdownEndsAt: Date.now() + WAIT_FOR_DEFUSE_TIMEOUT,
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

export const markPlayersAsPlaying = ({ context }: GameActionArgs) => {
  const players = context.players.map((p) => ({
    ...p,
    status: PlayerStatus.PLAYING,
  }));

  return { players };
};

const changeTurnState = (
  context: GameContext,
  turnsCount: number,
  isUnderAttack: boolean,
) => {
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
      return {
        currentTurnPlayerId: nextPlayer.id,
        turnsCount,
        isUnderAttack,
      };
    }
  }

  return context;
};

export const changeTurn = ({ context }: GameActionArgs) => {
  return changeTurnState(context, 1, false);
};

export const changeTurnUnderAttack = ({ context }: GameActionArgs) => {
  const turnsCount = context.isUnderAttack ? context.turnsCount + 2 : 2;

  return changeTurnState(context, turnsCount, true);
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
  if (
    event.type !== GameEvents.PLAY_CARD &&
    event.type !== GameEvents.PLAY_NOPE
  )
    return context;

  const { playerId, card } = event;
  const players = context.players;

  const player = players.find((player) => player.id === playerId);
  if (!player) return context;

  const hand = player.hand;

  const cardIndex = hand.findIndex((c) => c.id === card.id);
  if (cardIndex === -1) {
    return {
      lastPlayedCards: null,
    };
  }

  const playedCard = hand[cardIndex];
  const updatedHand = hand.filter((_, i) => i !== cardIndex);

  const updatedPlayers = players.map((player) =>
    player.id === playerId ? { ...player, hand: updatedHand } : player,
  );

  if (card.type !== CardType.NOPE) {
    return {
      players: updatedPlayers,
      lastPlayedCards: [playedCard!],
      pendingAction: card.type as PendingActionType,
    };
  } else {
    return {
      players: updatedPlayers,
      lastPlayedCards: [playedCard!],
    };
  }
};

export const shuffleDeck = ({ context }: GameActionArgs) => {
  const deck = context.deck.slice();
  shuffle(deck);
  return { deck };
};

export const skipTurn = ({ context }: GameActionArgs) => {
  return { turnsCount: context.turnsCount - 1 };
};

export const playCombo = ({ context, event }: GameActionArgs) => {
  if (event.type != GameEvents.PLAY_COMBO) return context;

  const { playerId, cardIds } = event;
  const player = context.players.find((player) => player.id === playerId);
  if (!player) return context;

  const cardIdsSet = new Set(cardIds);
  if (cardIdsSet.size !== cardIds.length) {
    return {
      lastPlayedCards: null,
    };
  }

  const playedCards = cardIds.map((cardId) =>
    player.hand.find((card) => card.id === cardId),
  );

  if (playedCards.some((card) => !card)) {
    return {
      lastPlayedCards: null,
    };
  }

  const updatedHand = player.hand.filter((card) => !cardIdsSet.has(card.id));

  if (updatedHand.length !== player.hand.length - cardIdsSet.size) {
    return {
      lastPlayedCards: null,
    };
  }

  const updatedPlayers = context.players.map((player) =>
    player.id === playerId ? { ...player, hand: updatedHand } : player,
  );

  const pendingAction =
    playedCards.length === 2
      ? PendingActionType.CAT_PAIR
      : PendingActionType.CAT_TRIPLE;

  return {
    players: updatedPlayers,
    lastPlayedCards: playedCards as Card[],
    pendingAction,
  };
};

export const defuseExplodingKitten = ({ context, event }: GameActionArgs) => {
  if (event.type != GameEvents.PLAY_DEFUSE) return context;

  const { playerId } = event;
  const players = context.players;

  const player = players.find((player) => player.id === playerId);
  if (!player) return context;

  const hand = player.hand;
  const defuseIndex = hand.findIndex((card) => card.type === CardType.DEFUSE);
  if (defuseIndex === -1) {
    return {
      lastPlayedCards: null,
    };
  }

  const defuseCard = hand[defuseIndex];
  const updatedHand = hand.filter((_, i) => i !== defuseIndex);

  const updatedPlayers = players.map((player) =>
    player.id === playerId ? { ...player, hand: updatedHand } : player,
  );

  return {
    players: updatedPlayers,
    lastPlayedCards: [defuseCard!],
  };
};

export const explodePlayer = ({ context }: GameActionArgs) => {
  const players = context.players.map((player) =>
    player.id !== context.currentTurnPlayerId
      ? player
      : {
          ...player,
          isAlive: false,
          status: PlayerStatus.ELIMINATED,
        },
  );
  return { players };
};

export const insertKitten = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.INSERT_KITTEN) return context;

  const lastDrawnCard = context.lastDrawnCard;
  if (!lastDrawnCard) return context;

  // Insert exploding kitten back to deck
  const deck = [...context.deck];
  const position = Math.min(
    Math.max(0, event.explodingKittenPosition),
    deck.length,
  );
  deck.splice(position, 0, lastDrawnCard);

  // Remove exploding kitten from current player hand
  const players = context.players;
  const player = players.find(
    (player) => player.id === context.currentTurnPlayerId,
  );
  if (!player) return context;

  const updatedHand = player.hand.filter(
    (card) => card.id !== lastDrawnCard.id,
  );

  const updatedPlayers = players.map((player) =>
    player.id !== context.currentTurnPlayerId
      ? player
      : { ...player, hand: updatedHand },
  );

  return {
    deck,
    players: updatedPlayers,
  };
};

export const setNopeWindow = ({ context, event }: GameActionArgs) => {
  if (
    event.type !== GameEvents.PLAY_CARD &&
    event.type !== GameEvents.PLAY_COMBO
  ) {
    return context;
  }

  const lastPlayedCards = context.lastPlayedCards;

  if (!lastPlayedCards?.length) return context;

  const nopeWindow: NopeWindow = {
    cards: lastPlayedCards,
    lastPlayerId: event.playerId,
    nopeCount: 0,
    endsAt: Date.now() + NOPE_WINDOW_MS,
  };

  return { nopeWindow };
};

export const clearNopeWindow = () => {
  return { nopeWindow: null };
};

export const addNope = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.PLAY_NOPE || !context.nopeWindow)
    return context;

  const nopeWindow: NopeWindow = {
    ...context.nopeWindow,
    nopeCount: context.nopeWindow.nopeCount + 1,
    lastPlayerId: event.playerId,
    endsAt: Date.now() + NOPE_WINDOW_MS,
  };

  return { nopeWindow };
};

export const selectPlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.SELECT_PLAYER) return context;
  return { selectedPlayerId: event.playerId };
};

export const passCardById = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.PASS_CARD_BY_ID) return context;

  const players = context.players.slice();
  let playerFrom;
  let playerTo;
  for (let i = 0; i < players.length; ++i) {
    if (players[i]?.id === event.playerIdFrom) playerFrom = players[i];
    else if (players[i]?.id === event.playerIdTo) playerTo = players[i];
  }

  if (!playerFrom) throw Error("playerFrom is undefined");
  if (!playerTo) throw Error("playerTo is undefined");

  const cardIndex = playerFrom.hand.findIndex(
    (card) => card.id === event.cardId,
  );
  const card = playerFrom.hand.splice(cardIndex, 1)[0];
  if (!card) throw Error("playerFrom doesn't have the card");

  const randomIndex = Math.floor(Math.random() * (playerTo.hand.length + 1));
  playerTo.hand.splice(randomIndex, 0, card);

  return { players, pendingAction: null };
};
