import { GameEvent, GameEvents } from "./events";
import { GameContext } from "./gameMachine";
import { createDeck, shuffleDeck } from "./utils/deck";

export const GameActions = {
  ADD_PLAYER: "addPlayer",
  REMOVE_PLAYER: "removePlayer",
  ADD_PLAYER_CONFIRMATION: "addPlayerConfirmation",
  REMOVE_PLAYER_CONFIRMATION: "removePlayerConfirmation",
  FILL_DECK: "fillDeck",
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

export const fillDeck = () => {
  const deck = createDeck();
  shuffleDeck(deck);

  return { deck };
};
