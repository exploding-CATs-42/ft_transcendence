import type { GameContext } from "./gameMachine";
import { type GameEvent, GameEvents } from "./events";
import { createDeck, dealInitialCards } from "../../utils";
import { assign } from "xstate";
import { GameAction, GameActionImplementation } from "./types";

export const GameActions = {
  ADD_PLAYER: "addPlayer",
  REMOVE_PLAYER: "removePlayer",
  ADD_PLAYER_CONFIRMATION: "addPlayerConfirmation",
  REMOVE_PLAYER_CONFIRMATION: "removePlayerConfirmation",
  FILL_DECK: "fillDeck",
  DEAL_CARDS: "dealCards",
} as const;

export interface GameActionArgs {
  context: GameContext;
  event: GameEvent;
}

const addPlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.JOIN_GAME) return context;

  return {
    players: [...context.players, event.player],
  };
};

const removePlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.LEAVE_GAME) return context;

  return {
    players: context.players.filter((p) => p.id !== event.playerId),
  };
};

const addPlayerConfirmation = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.CONFIRM_READINESS) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isConfirmed: true } : p,
    ),
  };
};

const removePlayerConfirmation = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.CANCEL_READINESS) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isConfirmed: false } : p,
    ),
  };
};

const fillDeck = () => {
  const deck = createDeck();
  return { deck };
};

const dealCards = ({ context }: GameActionArgs) => {
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

export default {
  [GameActions.ADD_PLAYER]: assign(addPlayer),
  [GameActions.REMOVE_PLAYER]: assign(removePlayer),
  [GameActions.ADD_PLAYER_CONFIRMATION]: assign(addPlayerConfirmation),
  [GameActions.REMOVE_PLAYER_CONFIRMATION]: assign(removePlayerConfirmation),
  [GameActions.FILL_DECK]: assign(fillDeck),
  [GameActions.DEAL_CARDS]: assign(dealCards),
} satisfies Record<GameAction, GameActionImplementation>;
