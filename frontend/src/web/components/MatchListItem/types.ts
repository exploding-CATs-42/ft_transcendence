export type LobbyPlayer = {
  id: string;
  avatarUrl: string;
};

export type LobbyMatch = {
  id: string;
  title: string;
  players: LobbyPlayer[];
};
