// Local level
import { START_GAME_COUNTDOWN_MS } from "./constants";
import { type GameEvent, type GameOutEvent, GameOutEvents } from "./events";
import type { HandPayload } from "./eventPayloads";
import type { GameContext } from "./gameMachine";
import { Card } from "../../types";

type GameEmitterArgs = {
  context: GameContext;
  event: GameEvent;
};

export const countdownStarted = (): GameOutEvent => ({
  type: GameOutEvents.COUNTDOWN_STARTED,
  endsAt: Date.now() + START_GAME_COUNTDOWN_MS,
});

export const countdownCanceled = (): GameOutEvent => ({
  type: GameOutEvents.COUNTDOWN_CANCELED,
});

export const gameStarted = (): GameOutEvent => ({
  type: GameOutEvents.GAME_STARTED,
});

export const cardsDealt = ({ context }: GameEmitterArgs): GameOutEvent => {
  const payload: HandPayload[] = context.players.map((player) => {
    // -------------------------------
    // Temporary console logs that have to be removed later
    console.log("---------------");
    console.log(`playerId: ${player.id},`);
    console.log(`cards: ${player.hand.map((card: Card) => card.type)}`);
    console.log("---------------");
    // -------------------------------

    return {
      playerId: player.id,
      cards: player.hand,
    };
  });

  return { type: GameOutEvents.CARDS_DEALT, payload };
};

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
