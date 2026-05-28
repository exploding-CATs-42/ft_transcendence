import { MIN_PLAYERS } from "../constants/game";
import { GameContext } from "./gameMachine";

export interface GameGuardArgs {
  context: GameContext;
}

export const canEnterStarting = ({ context }: GameGuardArgs) => {
  return (
    context.players.length >= MIN_PLAYERS &&
    context.players.every((p) => p.isConfirmed)
  );
};
