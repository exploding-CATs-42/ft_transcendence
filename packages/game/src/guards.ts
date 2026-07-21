// Local level
import type { GameContext } from "./gameMachine";
import { MIN_PLAYERS } from "./constants";
import { type GameEvent, GameEvents } from "./events";
import { CardType } from "./types";

export const GameGuards = {
  HAS_ENOUGH_PLAYERS: "hasEnoughPlayers",
  HAS_ENOUGH_CARDS: "hasEnoughCards",
  HAS_CARD_OF_TYPE: "hasCardOfType",
  IS_ENOUGH_CARDS_IN_DECK: "isEnoughCardsInDeck",
  HAS_REMAINING_TURNS: "hasRemainingTurns",
} as const;

export interface GameGuardArgs {
  context: GameContext;
  event: GameEvent;
}

export const hasEnoughPlayers = ({ context }: GameGuardArgs) => {
  return (
    context.players.length >= MIN_PLAYERS &&
    context.players.every((p) => p.isConfirmed)
  );
};

export const isEnoughCardsInDeck = ({ context }: GameGuardArgs) => {
  return context.deck.length >= 1;
};

export const hasEnoughCards = ({ context }: GameGuardArgs): boolean => {
  const player = context.players.find(
    (p) => p.id === context.currentTurnPlayerId,
  );

  return (player?.hand.length ?? 0) > 0;
};

export const hasCardOfType = (
  { event }: GameGuardArgs,
  params: { cardType: CardType },
) => {
  if (event.type !== GameEvents.PLAY_CARD) return false;
  return event.card.type === params.cardType;
};

export const hasRemainingTurns = ({ context }: GameGuardArgs) => {
  return context.turnsCount > 1;
};
