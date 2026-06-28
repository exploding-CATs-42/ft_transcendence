// Local level
import { MIN_PLAYERS } from "../../constants";
import { GameGuard, GameGuardArgs, GameGuardImplementation } from "./types";
import { PlayerStates } from "../Player";

export const GameGuards = {
  HAS_ENOUGH_PLAYERS: "hasEnoughPlayers",
} as const;

export const hasEnoughPlayers = ({ context }: GameGuardArgs) => {
  const allConfirmed = [...context.players.values()].every((p) =>
    p.getSnapshot().matches({ [PlayerStates.IN_LOBBY]: PlayerStates.READY }),
  );

  return context.players.size >= MIN_PLAYERS && allConfirmed;
};

export default {
  [GameGuards.HAS_ENOUGH_PLAYERS]: hasEnoughPlayers,
} satisfies Record<GameGuard, GameGuardImplementation>;
