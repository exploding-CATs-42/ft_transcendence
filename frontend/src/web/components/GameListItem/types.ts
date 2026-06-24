import type { UserId } from "pages/ProfilePage/types/ProfileUser";

export type LobbyGamePlayer = {
  id: UserId;
  username: string;
  avatarUrl: string | null;
};

export type LobbyGame = {
  gameId: string;
  gameName: string;
  maxPlayers?: number;
  players: LobbyGamePlayer[];
};

export interface UserGameHistoryItem extends LobbyGame {
  endedAt: Date;
  winnerId: UserId;
}

export type GameSlot = { id: number } & (
  | { kind: "real"; player: LobbyGamePlayer }
  | { kind: "placeholder" }
);
