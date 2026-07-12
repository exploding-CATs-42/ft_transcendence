import { toProfileUser } from "mappers";
import { Game, GameRecord } from "../types";

export const toGameRecord = (game: Game): GameRecord => {
  const { instance: _, ...record } = game;
  const players = game.instance.getSnapshot().context.players.map((player) =>
    toProfileUser({
      id: player.id,
      username: player.name,
      avatarUrl: player.avatarUrl,
    }),
  );

  return {
    ...record,
    players,
  };
};
