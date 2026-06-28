// Libraries
import {
  ActionFunction,
  ActorRefFrom,
  NonReducibleUnknown,
  type Snapshot,
} from "xstate";
// Local level
import { gameMachine } from "./gameMachine";
import { GameContext } from "./context";
import { GameEvent, GameOutEvent } from "./events";
import { GameActions } from "./actions";
import { GameGuards } from "./guards";

export type GameInstance = ActorRefFrom<typeof gameMachine>;
export type GameSnapshot = Snapshot<unknown>;

// Actions
export interface GameActionArgs {
  context: GameContext;
  event: GameEvent;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  spawn: Function;
}

export type GameAction = (typeof GameActions)[keyof typeof GameActions];
export type GameActionImplementation = ActionFunction<
  GameContext,
  GameEvent,
  GameEvent,
  NonReducibleUnknown,
  never,
  never,
  never,
  never,
  GameOutEvent
>;

// Guards
export interface GameGuardArgs {
  context: GameContext;
  event: GameEvent;
}

export type GameGuard = (typeof GameGuards)[keyof typeof GameGuards];
export type GameGuardImplementation = ({
  context,
  event,
}: GameGuardArgs) => boolean;
