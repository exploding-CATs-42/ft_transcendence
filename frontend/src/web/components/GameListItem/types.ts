import type { ProfileUser } from "pages/ProfilePage/types";
import type { UserId } from "pages/ProfilePage/types/ProfileUser";

export type LobbyGame = {
  gameId: string;
  gameName: string;
  players: ProfileUser[];
};

export interface UserGameHistoryItem extends LobbyGame {
  endedAt: Date;
  winnerId: UserId;
}

export type GameSlot = { id: number } & (
  | { kind: "real"; player: ProfileUser }
  | { kind: "placeholder" }
);
