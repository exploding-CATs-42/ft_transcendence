// Local level
import type { GameContext } from "./gameMachine";
import { MIN_PLAYERS } from "./constants";
import { GameEvents } from "./events";
import type { GameEvent } from "./events";
import { CardType } from "./types";

export const GameGuards = {
  HAS_ENOUGH_PLAYERS: "hasEnoughPlayers",
  HAS_ENOUGH_CARDS: "hasEnoughCards",
  HAS_CARD_OF_TYPE: "hasCardOfType",
  IS_ENOUGH_CARDS_IN_DECK: "isEnoughCardsInDeck",
  HAS_EXTRA_TURNS: "hasExtraTurns",
  HAS_DEFUSE_CARD: "hasDefuseCard",
  IS_EXPLODING_KITTEN_DRAWN: "isExplodingKittenDrawn",
  IS_ONLY_ONE_PLAYER_LEFT_ALIVE: "isOnlyOnePlayerLeftAlive",
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

export const hasExtraTurns = ({ context }: GameGuardArgs) => {
  return context.turnsCount > 1;
};

export const hasDefuseCard = ({ context }: GameGuardArgs) => {
  const player = context.players.find(
    (player) => player.id === context.currentTurnPlayerId,
  );

  return player?.hand.some((card) => card.type === CardType.DEFUSE) ?? false;
};

export const isExplodingKittenDrawn = ({ context }: GameGuardArgs) => {
  return context.lastDrawnCard?.type === CardType.EXPLODING_KITTEN;
};

export const isOnlyOnePlayerLeftAlive = ({ context }: GameGuardArgs) => {
  const aliveCount = context.players.filter((player) => player.isAlive).length;
  return aliveCount === 1;
};
