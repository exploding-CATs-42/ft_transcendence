import type { MatchSlot, LobbyPlayer } from "./types";

const MAX_PLAYERS = 5 as const; //! Will be replaced with real data later

export const createMatchSlots = (players: LobbyPlayer[]): MatchSlot[] => {
  return Array.from({ length: MAX_PLAYERS }, (_, id) =>
    players[id]
      ? { id, kind: "real", player: players[id] }
      : { id, kind: "placeholder" }
  );
};

export const isPlaceholderSlot = (slot: MatchSlot) => {
  return slot.kind == "placeholder";
};
