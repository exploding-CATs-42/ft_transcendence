export type LobbyPlayer = {
  id: string;
  avatarUrl: string;
};

export type LobbyMatch = {
  id: string;
  title: string;
  players: LobbyPlayer[];
};

export type MatchSlot = { id: number } & (
  | { kind: "real"; player: LobbyPlayer }
  | { kind: "placeholder" }
);
