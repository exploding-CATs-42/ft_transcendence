import type { ProfileUser } from "pages/ProfilePage/types";
import type { UserId } from "pages/ProfilePage/types/ProfileUser";

export type LobbyMatch = {
  gameId: string;
  gameName: string;
  players: ProfileUser[];
};

export interface UserGameHistoryItem extends LobbyMatch {
  endedAt: Date;
  winnerId: UserId;
}

export type MatchSlot = { id: number } & (
  | { kind: "real"; player: ProfileUser }
  | { kind: "placeholder" }
);
