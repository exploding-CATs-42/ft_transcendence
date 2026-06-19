// Local level
import type { GameContext } from "./gameMachine";
import { MIN_PLAYERS } from "./constants";

export const GameGuards = {
  HAS_ENOUGH_PLAYERS: "hasEnoughPlayers",
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
