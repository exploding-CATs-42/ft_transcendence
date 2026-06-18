import type { UserGameHistoryItem } from "components/GameListItem/types";
import type { ProfileStat } from "../types";
import type { UserId } from "../types/ProfileUser";

export function buildStats(
  userId: UserId,
  games: UserGameHistoryItem[],
): ProfileStat[] {
  const totalGames = games.length;

  const gamesWon = games.filter((m) => m.winnerId === userId).length;

  const explodedTimes = totalGames - gamesWon;

  const successRate =
    totalGames === 0 ? 0 : Math.round((gamesWon / totalGames) * 100);

  return [
    {
      id: 0,
      icon: "bomb",
      name: "Exploded times",
      amount: explodedTimes,
    },
    {
      id: 1,
      icon: "medal",
      name: "Games won",
      amount: gamesWon,
    },
    {
      id: 2,
      icon: "gamepad",
      name: "Games played",
      amount: totalGames,
    },
    {
      id: 3,
      icon: "percent",
      name: "Success rate",
      amount: successRate,
    },
  ];
}
