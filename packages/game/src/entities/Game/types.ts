// Libraries
import {
  ActionFunction,
  Actor,
  NonReducibleUnknown,
  type Snapshot,
} from "xstate";
// Local level
import { GameContext, gameMachine } from "./gameMachine";
import { GameEvent, GameOutEvent } from "./events";
import { GameActions } from "./actions";

export type GameInstance = Actor<typeof gameMachine>;
export type GameSnapshot = Snapshot<unknown>;

// Actions
export interface GameActionArgs {
  context: GameContext;
  event: GameEvent;
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
