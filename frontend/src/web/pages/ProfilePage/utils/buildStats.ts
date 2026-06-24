import type { ProfileStat } from "../types";
import type { ProfileUserWithStats } from "../types/ProfileUser";

export function buildStats(user: ProfileUserWithStats): ProfileStat[] {
  const totalGames = user.totalGames;
  const gamesWon = user.wins;

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
