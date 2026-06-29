// Libraries
import type { ActionFunction, ActorRefFrom, NonReducibleUnknown } from "xstate";
// Local level
import type { OpponentActions } from "./actions";
import type { OpponentContext } from "./context";
import type { OpponentEvent, OpponentOutEvent } from "./events";
import type { OpponentGuards } from "./guards";
import type { opponentMachine } from "./opponentMachine";

// Machine
export type OpponentInstance = ActorRefFrom<typeof opponentMachine>;

// Actions
export interface OpponentActionArgs {
  context: OpponentContext;
  event: OpponentEvent;
}

export type OpponentAction =
  (typeof OpponentActions)[keyof typeof OpponentActions];
export type ActionImplementation = ActionFunction<
  OpponentContext,
  OpponentEvent,
  OpponentEvent,
  NonReducibleUnknown,
  never,
  never,
  never,
  never,
  OpponentOutEvent
>;

// Guards
export interface OpponentGuardArgs {
  context: OpponentContext;
  event: OpponentEvent;
}

export type OpponentGuard =
  (typeof OpponentGuards)[keyof typeof OpponentGuards];
export type GuardImplementation = ({
  context,
  event,
}: OpponentGuardArgs) => boolean;
