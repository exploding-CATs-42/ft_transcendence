import type { GameSlot, LobbyPlayer } from "./types";

const DEFAULT_MAX_PLAYERS = 5;

const getSlotCount = (
  players: LobbyPlayer[],
  maxPlayers: number | undefined,
): number => {
  return Math.max(maxPlayers ?? DEFAULT_MAX_PLAYERS, players.length);
};

export const createGameSlots = (
  players: LobbyPlayer[],
  maxPlayers?: number,
): GameSlot[] => {
  return Array.from({ length: getSlotCount(players, maxPlayers) }, (_, id) =>
    players[id]
      ? { id, kind: "real", player: players[id] }
      : { id, kind: "placeholder" },
  );
};

export const isPlaceholderSlot = (slot: GameSlot) => {
  return slot.kind == "placeholder";
};
