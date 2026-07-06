import { Game, GameRecord } from "../types";

export const toGameRecord = (game: Game): GameRecord => {
  const { instance: _, ...record } = game;
  const players = game.instance.getSnapshot().context.players.map((player) => ({
    id: player.id,
    name: player.name,
    avatarUrl: player.avatarUrl,
    isConfirmed: player.isConfirmed,
  }));

  return {
    ...record,
    players,
  };
};
