import type { ProfileUser, UserId } from "@exploding-cats/contracts";

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
