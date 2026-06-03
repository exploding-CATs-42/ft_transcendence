import type { UserGameHistoryItem } from "components/MatchListItem/types";
import type { ProfileStat, ProfileUser, FriendItem } from "./types";

export const profileUserMock: ProfileUser = {
  id: "uid1",
  username: "Lera",
  avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
  isOnline: false,
  lastSeenAt: new Date(),
};

export const statsMock: ProfileStat[] = [
  {
    id: 1,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111",
  },
  {
    id: 2,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111",
  },
  {
    id: 3,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111",
  },
  {
    id: 4,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111",
  },
];

export const matchesMock: UserGameHistoryItem[] = [
  {
    gameId: "g-1",
    gameName: "Table 1",
    endedAt: new Date("2026-06-01T14:30:00Z"),
    winnerId: "u-1",
    players: [
      {
        id: "u-1",
        username: "alice",
        avatarUrl: null,
        isOnline: true,
        lastSeenAt: new Date(),
      },
      {
        id: "u-2",
        username: "bob",
        avatarUrl: null,
        isOnline: false,
        lastSeenAt: new Date("2026-06-01T14:35:00Z"),
      },
    ],
  },
  {
    gameId: "g-2",
    gameName: "Table 2",
    endedAt: new Date("2026-05-30T18:15:00Z"),
    winnerId: "u-1",
    players: [
      {
        id: "u-1",
        username: "alice",
        avatarUrl: null,
        isOnline: true,
        lastSeenAt: new Date(),
      },
      {
        id: "u-3",
        username: "charlie",
        avatarUrl: null,
        isOnline: true,
        lastSeenAt: new Date(),
      },
    ],
  },
  {
    gameId: "g-3",
    gameName: "Table 3",
    endedAt: new Date("2026-05-28T20:45:00Z"),
    winnerId: "u-2",
    players: [
      {
        id: "u-1",
        username: "alice",
        avatarUrl: null,
        isOnline: true,
        lastSeenAt: new Date(),
      },
      {
        id: "u-2",
        username: "bob",
        avatarUrl: null,
        isOnline: false,
        lastSeenAt: new Date(),
      },
      {
        id: "u-4",
        username: "david",
        avatarUrl: null,
        isOnline: false,
        lastSeenAt: new Date("2026-05-29T08:00:00Z"),
      },
    ],
  },
];

export const friendsMock: FriendItem[] = [
  {
    user: {
      id: "f-1",
      username: "Sasha",
      avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
      isOnline: true,
      lastSeenAt: new Date("2026-05-19T14:30:00Z"),
    },
    status: "ACCEPTED",
    direction: "accepted",
  },
  {
    user: {
      id: "f-2",
      username: "Vanya",
      avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
      isOnline: false,
      lastSeenAt: new Date("2026-05-21T09:12:00Z"),
    },
    status: "PENDING",
    direction: "incoming",
  },
  {
    user: {
      id: "f-3",
      username: "Lera",
      avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
      isOnline: true,
      lastSeenAt: new Date("2026-05-19T14:30:00Z"),
    },
    status: "ACCEPTED",
    direction: "accepted",
  },
  {
    user: {
      id: "f-4",
      username: "Max",
      avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
      isOnline: false,
      lastSeenAt: new Date("2026-05-20T22:48:00Z"),
    },
    status: "PENDING",
    direction: "outgoing",
  },
  {
    user: {
      id: "f-5",
      username: "Anya",
      avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
      isOnline: false,
      lastSeenAt: new Date("2026-05-19T14:30:00Z"),
    },
    status: "REJECTED",
    direction: "outgoing",
  },
  {
    user: {
      id: "f-6",
      username: "Dima",
      avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
      isOnline: true,
      lastSeenAt: new Date("2026-05-19T14:30:00Z"),
    },
    status: "ACCEPTED",
    direction: "accepted",
  },
];
