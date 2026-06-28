// Local level
import type { GameContext } from "./gameMachine";
import { MIN_PLAYERS } from "./constants";

export const GameGuards = {
  HAS_ENOUGH_PLAYERS: "hasEnoughPlayers",
  HAS_ENOUGH_CARDS: "hasEnoughCards",
} as const;

export interface GameGuardArgs {
  context: GameContext;
}

export const hasEnoughPlayers = ({ context }: GameGuardArgs) => {
  return (
    context.players.length >= MIN_PLAYERS &&
    context.players.every((p) => p.isConfirmed)
  );
};

export const hasEnoughCards = ({ context }: GameGuardArgs) => {
  return context.deck.length >= 1;
};
