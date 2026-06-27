// Libraries
import type { Actor } from "xstate";
// Local level
import type { playerMachine } from "./playerMachine";

// Machine
export type PlayerInstance = Actor<typeof playerMachine>;
