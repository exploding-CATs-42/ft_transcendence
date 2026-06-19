// Libraries
import { Actor, type Snapshot } from "xstate";
// Local level
import { gameMachine } from "../gameMachine";

export interface GameRules {
  dealtCardsPerPlayer: number;
  defusesDealtPerPlayer: number;
  maxDefusesShuffledBack: number;
  totalDefuses: number;
  seeTheFutureCount: number;
  minPlayers: number;
  maxPlayers: number;
  fasterVariantRemoveFraction: number;
  nopeWindowMs: number;
}

export type GameInstance = Actor<typeof gameMachine>;
export type GameSnapshot = Snapshot<unknown>;
