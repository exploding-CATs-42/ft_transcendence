import type { GameContext } from "./gameMachine";
import { type GameEvent, GameEvents } from "./events";
import { createDeck, dealInitialCards } from "../../utils";

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

export const addPlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.JOIN_GAME) return context;

  return {
    players: [...context.players, event.player],
  };
};

export const removePlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.LEAVE_GAME) return context;

  return {
    players: context.players.filter((p) => p.id !== event.playerId),
  };
};

export const addPlayerConfirmation = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEvents.CONFIRM_READINESS) return context;

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
