import type { ProfileUser } from "@exploding-cats/contracts";
import type { LobbyGame } from "types";

const alice: ProfileUser = {
  id: "u-1",
  username: "Alice",
  isOnline: true,
  avatarUrl: null,
};

const bob: ProfileUser = {
  id: "u-2",
  username: "Bob",
  isOnline: false,
  avatarUrl: null,
};

const charlie: ProfileUser = {
  id: "u-3",
  username: "Charlie",
  isOnline: true,
  avatarUrl: null,
};

const diana: ProfileUser = {
  id: "u-4",
  username: "Diana",
  isOnline: true,
  avatarUrl: null,
};

export const gamesMock: LobbyGame[] = [
  {
    gameId: "g-1",
    gameName: "Table 1",
    players: [alice, bob],
  },
  {
    gameId: "g-2",
    gameName: "Table 2",
    players: [charlie, diana, charlie],
  },
  {
    gameId: "g-3",
    gameName: "Table 3",
    players: [alice, bob, charlie, diana],
  },
  {
    gameId: "g-4",
    gameName: "Table 4",
    players: [alice, diana],
  },
];
