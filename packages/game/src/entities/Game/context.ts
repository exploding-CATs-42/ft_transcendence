// Libraries
import { ActorRefFrom } from "xstate";
// Local level
import { playerMachine } from "../Player";
import { Deck } from "../../types";

export interface GameContext {
  players: Map<string, ActorRefFrom<typeof playerMachine>>;
  deck: Deck;
}
