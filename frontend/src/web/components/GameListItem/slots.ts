import type { ProfileUser } from "@exploding-cats/contracts";
import type { GameSlot } from "./types";

export const createGameSlots = (
  players: ProfileUser[],
  slotCount: number,
): GameSlot[] => {
  return Array.from({ length: Math.max(slotCount, players.length) }, (_, id) =>
    players[id]
      ? { id, kind: "real", player: players[id] }
      : { id, kind: "placeholder" },
  );
};

export const isPlaceholderSlot = (slot: GameSlot) => {
  return slot.kind == "placeholder";
};
