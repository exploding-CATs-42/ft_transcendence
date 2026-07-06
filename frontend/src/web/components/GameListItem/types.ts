import type { ProfileUser, UserId } from "@exploding-cats/contracts";

export type LobbyPlayer = {
  id: string;
  avatarUrl: string | null;
};

export type LobbyGame = {
  gameId: string;
  gameName: string;
  maxPlayers?: number;
  players: LobbyPlayer[];
};

export interface UserGameHistoryItem extends Omit<
  LobbyGame,
  "players" | "maxPlayers"
> {
  endedAt: Date;
  winnerId: UserId;
  players: ProfileUser[];
}

export type GameSlot = { id: number } & (
  | { kind: "real"; player: LobbyPlayer }
  | { kind: "placeholder" }
);
