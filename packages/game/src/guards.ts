// Local level
import type { GameContext } from "./gameMachine";
import { MIN_PLAYERS } from "./constants";
import { GameEvents } from "./events";
import type { GameEvent } from "./events";
import { CardType, PendingActionType } from "./types";

export const GameGuards = {
  HAS_ENOUGH_PLAYERS: "hasEnoughPlayers",
  HAS_ENOUGH_CARDS: "hasEnoughCards",
  HAS_CARD_OF_TYPE: "hasCardOfType",
  IS_ENOUGH_CARDS_IN_DECK: "isEnoughCardsInDeck",
  HAS_EXTRA_TURNS: "hasExtraTurns",
  HAS_DEFUSE_CARD: "hasDefuseCard",
  IS_EXPLODING_KITTEN_DRAWN: "isExplodingKittenDrawn",
  IS_ONLY_ONE_PLAYER_LEFT_ALIVE: "isOnlyOnePlayerLeftAlive",
  LEAVES_SINGLE_ALIVE_PLAYER: "leavesSingleAlivePlayer",
  IS_PLAYERS_TURN: "isPlayersTurn",
  IS_WINDOW_CARD_OF_TYPE: "isWindowCardOfType",
  IS_NOPED: "isNoped",
  CAN_PLAY_NOPE: "canPlayNope",
  HAS_REMAINING_TURNS: "hasRemainingTurns",
  PENDING_ACTION_OF_TYPE: "pendingActionOfType",
  HAS_CARD_OF_THAT_TYPE: "hasCardOfThatType",
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

export const hasCardOfThatType = ({ context, event }: GameGuardArgs) => {
  if (event.type !== GameEvents.CHOOSE_CARD_TYPE) return false;
  const targetPlayer = context.players.find(
    (p) => p.id === context.selectedPlayerId,
  );
  if (!targetPlayer) throw Error("Player is not selected");
  const card = targetPlayer.hand.find((card) => card.type === event.cardType);
  return card ? true : false;
};

export const hasExtraTurns = ({ context }: GameGuardArgs) => {
  return context.turnsCount > 1;
};

export const hasRemainingTurns = ({ context }: GameGuardArgs) => {
  return context.turnsCount > 0;
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

export const leavesSingleAlivePlayer = ({ context, event }: GameGuardArgs) => {
  if (event.type !== GameEvents.LEAVE_GAME) return false;

  const alivePlayers = context.players.filter((player) => player.isAlive);

  // An already eliminated player leaving must not end the game for the others.
  return (
    alivePlayers.length === MIN_PLAYERS &&
    alivePlayers.some((player) => player.id === event.playerId)
  );
};

export const isOnlyOnePlayerLeftAlive = ({ context }: GameGuardArgs) => {
  const aliveCount = context.players.filter((player) => player.isAlive).length;
  return aliveCount === 1;
};

export const isPlayersTurn = ({ context, event }: GameGuardArgs) => {
  if (
    event.type !== GameEvents.PLAY_CARD &&
    event.type !== GameEvents.DRAW_CARD &&
    event.type !== GameEvents.PLAY_COMBO
  ) {
    return false;
  }

  return context.currentTurnPlayerId === event.playerId;
};

export const isWindowCardOfType = (
  { context }: GameGuardArgs,
  params: { cardType: CardType },
) => {
  const cards = context.nopeWindow?.cards;

  // Only a single card can match a type, combos (e.g. two Skips) must not trigger single-card transitions.
  if (cards?.length !== 1) return false;

  return cards[0]!.type === params.cardType;
};

export const isNoped = ({ context }: GameGuardArgs) => {
  const nopeCount = context.nopeWindow?.nopeCount ?? 0;

  return nopeCount % 2 === 1;
};

export const canPlayNope = ({ context, event }: GameGuardArgs) => {
  const { nopeWindow, players } = context;

  if (event.type !== GameEvents.PLAY_NOPE || !nopeWindow) return false;
  if (event.card.type !== CardType.NOPE) return false;
  if (event.playerId === nopeWindow.lastPlayerId) return false;

  const player = players.find((p) => p.id === event.playerId);

  return player?.isAlive ?? false;
};

export const pendingActionOfType = (
  { context }: GameGuardArgs,
  params: { actionType: PendingActionType },
) => {
  return context.pendingAction === params.actionType;
};
