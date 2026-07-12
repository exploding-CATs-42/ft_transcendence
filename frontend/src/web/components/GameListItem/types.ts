import type {
  GameRecord,
  ProfileUser,
  UserGameHistoryItem as SharedUserGameHistoryItem,
} from "@exploding-cats/contracts";

export type LobbyGame = GameRecord;
export type UserGameHistoryItem = SharedUserGameHistoryItem;
export type GameListItemData = LobbyGame | UserGameHistoryItem;

export type GameSlot = { id: number } & (
  | { kind: "real"; player: ProfileUser }
  | { kind: "placeholder" }
);
