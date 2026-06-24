import type { GameSlot, LobbyGamePlayer } from "./types";

const MAX_PLAYERS = 5;

export const createGameSlots = (players: LobbyGamePlayer[]): GameSlot[] => {
  const playerSlots: GameSlot[] = players.map((player, index) => ({
    id: index,
    kind: "real",
    player,
  }));

  const placeholderSlots: GameSlot[] = Array.from(
    { length: Math.max(MAX_PLAYERS - players.length, 0) },
    (_, index) => ({
      id: players.length + index,
      kind: "placeholder",
    }),
  );

  return [...playerSlots, ...placeholderSlots];
};

export const isPlaceholderSlot = (slot: GameSlot) => {
  return slot.kind === "placeholder";
};
