// Local level
import { MIN_PLAYERS } from "../../constants";
import { GameGuard, GameGuardArgs, GameGuardImplementation } from "./types";

export const GameGuards = {
  HAS_ENOUGH_PLAYERS: "hasEnoughPlayers",
} as const;

const hasEnoughPlayers = ({ context }: GameGuardArgs) => {
  return (
    context.players.length >= MIN_PLAYERS &&
    context.players.every((p) => p.isConfirmed)
  );
};

export default {
  [GameGuards.HAS_ENOUGH_PLAYERS]: hasEnoughPlayers,
} satisfies Record<GameGuard, GameGuardImplementation>;
