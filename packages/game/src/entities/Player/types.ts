// Libraries
import type { ActorRefFrom } from "xstate";
// Local level
import type { playerMachine } from "./playerMachine";

// Machine
export type PlayerInstance = ActorRefFrom<typeof playerMachine>;
