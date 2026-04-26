import type { LobbyMatch } from 'components/MatchListItem/types';
import type { FriendItem } from './components/FriendListItem/FriendListItem';
import type { ProfileStat, ProfileUser } from 'types';

export const profileUserMock: ProfileUser = {
  id: "uid1",
  username: "Lera",
  avatarUrl:
    "/src/web/assets/images/avatar/avatar-193w.png",
  isOnline: false,
  lastSeenAt: new Date()
};

export const statsMock: ProfileStat[] = [
  {
    id: 1,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111"
  },
  {
    id: 2,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111"
  },
  {
    id: 3,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111"
  },
  {
    id: 4,
    icon: "/src/web/assets/images/nuclear-explosion/nuclear-explosion-76w.png",
    alt: "nuclear explosion",
    name: "Exploded times",
    amount: "1111"
  }
];

export const matchesMock: LobbyMatch[] = [
  {
    id: "g-100",
    title: "Table 1",
    players: [
      {
        id: "u-1",
        avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png"
      },
      {
        id: "u-2",
        avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png"
      },
      {
        id: "u-3",
        avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png"
      }
    ]
  },
  {
    id: "g-101",
    title: "Table 2",
    players: [
      {
        id: "u-4",
        avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png"
      },
      {
        id: "u-5",
        avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png"
      }
    ]
  }
];

export const friendsMock: FriendItem[] = [
  {
    id: "f-1",
    username: "Sasha",
    avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
    isOnline: true
  },
  {
    id: "f-2",
    username: "Vanya",
    avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
    isOnline: false
  },
  {
    id: "f-3",
    username: "Lera",
    avatarUrl: "/src/web/assets/images/avatar/avatar-193w.png",
    isOnline: true
  }
];