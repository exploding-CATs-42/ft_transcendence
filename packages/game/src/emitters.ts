// Local level
import { type GameEvent, type GameOutEvent, GameOutEvents } from "./events";
import type { GameContext } from "./gameMachine";
import { CardType } from "./types";

type GameEmitterArgs = {
  context: GameContext;
  event: GameEvent;
};

export const countdownStarted = ({
  context,
}: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.COUNTDOWN_STARTED,
  endsAt: context.countdownEndsAt!,
});

export const countdownCanceled = (): GameOutEvent => ({
  type: GameOutEvents.COUNTDOWN_CANCELED,
});

export const gameStarted = ({ context }: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.GAME_STARTED,
  players: context.players,
  deckSize: context.deck.length,
});

export const turnChanged = ({ context }: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.TURN_CHANGED,
  payload: {
    playerId: context.currentTurnPlayerId!,
    attackCount: context.turnsCount,
  },
});

export const deckShuffled = (): GameOutEvent => ({
  type: GameOutEvents.DECK_SHUFFLED,
});

export const turnSkipped = ({ context }: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.TURN_SKIPPED,
  payload: {
    playerId: context.currentTurnPlayerId!,
    attackCount: context.turnsCount,
  },
});

export const showedTopThreeCards = ({
  context,
}: GameEmitterArgs): GameOutEvent => {
  const topThreeCards = context.deck.slice(0, 3);
  const playerId = context.currentTurnPlayerId!;

  return {
    type: GameOutEvents.SHOWED_TOP_CARDS,
    payload: { playerId, cards: topThreeCards },
  };
};

export const kittenDrawn = (): GameOutEvent => ({
  type: GameOutEvents.EXPLODING_KITTEN_DRAWN,
});

export const playerDefused = ({ context }: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.PLAYER_DEFUSED,
  payload: {
    playerId: context.currentTurnPlayerId!,
    deckSize: context.deck.length,
  },
});

export const defusePrompt = ({ context }: GameEmitterArgs): GameOutEvent => {
  const player = context.players.find(
    (p) => p.id === context.currentTurnPlayerId,
  );

  const canDefuse =
    player?.hand.some((card) => card.type === CardType.DEFUSE) ?? false;

  return {
    type: GameOutEvents.DEFUSE_PROMPT,
    payload: {
      playerId: context.currentTurnPlayerId!,
      endsAt: context.countdownEndsAt!,
      canDefuse,
    },
  };
};

export const kittenInserted = ({ context }: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.KITTEN_INSERTED,
  payload: {
    cardId: context.lastDrawnCard!.id,
    playerId: context.currentTurnPlayerId!,
  },
});

export const playerEliminated = ({
  context,
}: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.PLAYER_ELIMINATED,
  payload: { playerId: context.currentTurnPlayerId! },
});

export const gameOver = ({ context }: GameEmitterArgs): GameOutEvent => {
  const winner = context.players.find((player) => player.isAlive)!;

  return {
    type: GameOutEvents.GAME_OVER,
    payload: {
      winner: {
        id: winner.id,
        name: winner.name,
        avatarUrl: winner.avatarUrl,
      },
    },
  };
};

export const nopeWindowResolved = (): GameOutEvent => ({
  type: GameOutEvents.NOPE_WINDOW_RESOLVED,
});

export const playerSelected = ({ context }: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.PLAYER_SELECTED,
  payload: { playerId: context.selectedPlayerId! },
});

export const waitingForPlayerSelection = (): GameOutEvent => ({
  type: GameOutEvents.WAITING_FOR_PLAYER_SELECTION,
});

export const waitingForFavorCardSelection = ({
  context,
}: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.WAITING_FOR_FAVOR_CARD_SELECTION,
  payload: { playerId: context.selectedPlayerId! },
});

export const playerSawTheFuture = ({
  context,
}: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.PLAYER_SAW_THE_FUTURE,
  payload: { playerId: context.currentTurnPlayerId! },
});

export const comboSelectionRequested = ({
  context,
}: GameEmitterArgs): GameOutEvent => ({
  type: GameOutEvents.COMBO_SELECTION_REQUESTED,
  payload: {
    playerId: context.pendingCombo!.playerId,
    comboSize: context.pendingCombo!.comboSize,
    ...(context.pendingCombo!.targetPlayerId
      ? { targetPlayerId: context.pendingCombo!.targetPlayerId }
      : {}),
    ...(context.pendingCombo!.requestedCardType
      ? { requestedCardType: context.pendingCombo!.requestedCardType }
      : {}),
    targets: context.players
      .filter(
        (player) =>
          player.id !== context.pendingCombo!.playerId &&
          (!context.pendingCombo!.targetPlayerId ||
            player.id === context.pendingCombo!.targetPlayerId) &&
          player.isAlive &&
          (player.hand.length > 0 ||
            (Boolean(context.pendingCombo!.targetPlayerId) &&
              context.pendingCombo!.comboSize === 3)),
      )
      .map((player) => ({
        playerId: player.id,
        handSize: player.hand.length,
      })),
  },
});

/* emitter - is a function that emits an "event" object to the "outside world",
 * giving it it's type and optional payload.
 * it takes as a parameter an object, containing machine context,
 * and an event that triggered the emission
 */

// emitter example
/*
 import { GameContext } from "./gameMachine";
 import { GameEvent } from "./events"
 type GameEmitterArgs = {
   context: GameContext;
   event: GameEvent;
 }
 export const emitter = ({ context, event }: GameEmitterArgs): GameOutEvent => {
   if (context.players.length < 1) console.log("it's lonely out here")
   return { type: GameOutEvents.PLAYER_ADDED, playerId: event.playerId };
 };
*/

// flow example
/*
on: {
  PLAYER_JOINED: {
    actions: emit(({ context, event }) => ({
      type: "PLAYER_ADDED",
      playerId: event.playerId,
    })),
  },
},

where "event" passed to the emitter is "PLAYER_JOINED"
and event emitted to the "outside world" is "PLAYER_ADDED"
*/
