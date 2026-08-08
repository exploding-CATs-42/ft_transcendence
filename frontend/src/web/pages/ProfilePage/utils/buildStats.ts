import {
  getExplodedTimes,
  getSuccessRate,
  type ProfileUserWithStats,
} from "@exploding-cats/contracts";

import type { ProfileStat } from "../types";

export function buildStats(user: ProfileUserWithStats): ProfileStat[] {
  return [
    {
      id: 0,
      icon: "bomb",
      name: "Exploded times",
      amount: getExplodedTimes(user),
    },
    {
      id: 1,
      icon: "medal",
      name: "Games won",
      amount: user.wins,
    },
    {
      id: 2,
      icon: "gamepad",
      name: "Games played",
      amount: user.totalGames,
    },
    {
      id: 3,
      icon: "percent",
      name: "Success rate",
      amount: getSuccessRate(user),
    },
  ];
}
