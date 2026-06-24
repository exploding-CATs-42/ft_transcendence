import { Game, GameRecord } from "../types";

export const toGameRecord = (game: Game): GameRecord => {
  const players = game.instance.getSnapshot().context.players.map((player) => ({
    id: player.id,
    username: player.name,
    avatarUrl: player.avatarUrl,
  }));

  return {
    id: game.id,
    name: game.name,
    maxPlayers: game.maxPlayers,
    createdAt: game.createdAt,
    players,
  };
};
