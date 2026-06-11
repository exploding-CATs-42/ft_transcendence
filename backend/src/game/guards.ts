// Project level
import { MIN_PLAYERS } from "constants/game";
// Local level
import { GameContext } from "./gameMachine";

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
