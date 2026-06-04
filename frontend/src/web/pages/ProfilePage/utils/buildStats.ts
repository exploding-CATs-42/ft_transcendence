import type { UserGameHistoryItem } from "components/MatchListItem/types";
import type { ProfileStat } from "../types";
import type { UserId } from "../types/ProfileUser";

export function buildStats(
  userId: UserId,
  matches: UserGameHistoryItem[],
): ProfileStat[] {
  const totalMatches = matches.length;

  const gamesWon = matches.filter((m) => m.winnerId === userId).length;

  const explodedTimes = totalMatches - gamesWon;

  const successRate =
    totalMatches === 0 ? 0 : Math.round((gamesWon / totalMatches) * 100);

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
      icon: "percent",
      name: "Success rate",
      amount: successRate,
    },
    {
      id: 3,
      icon: "gamepad",
      name: "Games played",
      amount: totalMatches,
    },
  ];
}
