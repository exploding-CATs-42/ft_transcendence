import type { Card } from "./card";

export const PlayerStatus = {
  WAITING: "Waiting",
  PLAYING: "Playing",
  ELIMINATED: "Eliminated",
  LEFT: "Left",
  FINISHED: "Finished",
} as const;

export type PlayerStatus = (typeof PlayerStatus)[keyof typeof PlayerStatus];

export interface Player {
  id: string;
  name: string;
  avatarUrl: string | null;
  hand: Card[];
  isConfirmed: boolean;
  status: PlayerStatus;
}
