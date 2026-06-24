import type { GameSlot, LobbyGamePlayer } from "./types";

const DEFAULT_MAX_PLAYERS = 5;

export const createGameSlots = (
  players: LobbyGamePlayer[],
  maxPlayers = DEFAULT_MAX_PLAYERS,
): GameSlot[] => {
  const slotCount = Math.max(maxPlayers, players.length);

  const playerSlots: GameSlot[] = players.map((player, index) => ({
    id: index,
    kind: "real",
    player,
  }));

  const placeholderSlots: GameSlot[] = Array.from(
    { length: Math.max(slotCount - players.length, 0) },
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
