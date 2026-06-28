// Libraries
import type { ActionFunction, Actor, NonReducibleUnknown } from "xstate";
// Local level
import type { PlayerActions } from "./actions";
import type { PlayerContext } from "./context";
import type { PlayerEvent, PlayerOutEvent } from "./events";
import type { PlayerGuards } from "./guards";
import type { opponentMachine } from "./opponentMachine";

// Machine
export type PlayerInstance = Actor<typeof opponentMachine>;

// Actions
export interface PlayerActionArgs {
  context: PlayerContext;
  event: PlayerEvent;
}

export type PlayerAction = (typeof PlayerActions)[keyof typeof PlayerActions];
export type ActionImplementation = ActionFunction<
  PlayerContext,
  PlayerEvent,
  PlayerEvent,
  NonReducibleUnknown,
  never,
  never,
  never,
  never,
  PlayerOutEvent
>;

// Guards
export interface PlayerGuardArgs {
  context: PlayerContext;
  event: PlayerEvent;
}

export type PlayerGuard = (typeof PlayerGuards)[keyof typeof PlayerGuards];
export type GuardImplementation = ({
  context,
  event,
}: PlayerGuardArgs) => boolean;
