import { CardInstance } from "../types/card";

export interface MachinePlayer {
  playerId: string;
  displayName: string;
  hand: CardInstance[];
}

export interface GameContext {
  players: MachinePlayer[];
  currentPlayerIndex: number;
  deck: CardInstance[];
  turnNumber: number;
  cardsPerPlayer: number;
}

export interface MachineInput {
  players: { playerId: string; displayName: string }[];
  deckSize: number;
  cardsPerPlayer: number;
}

export type MachineEvent = { type: "DRAW_CARD"; playerId: string };
