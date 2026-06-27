import { MyProfileUser, ProfileUser } from "@exploding-cats/contracts";

// Project level
export function toProfileUser(user: {
  id: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}): ProfileUser {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
    lastSeenAt: user.lastSeenAt,
  };
}

export function toSelfProfileUser(user: {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
}): MyProfileUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
    isOnline: user.isOnline,
    lastSeenAt: user.lastSeenAt,
  };
}

export function toProfileUserWithStats(
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: Date | null;
  },
  stats: {
    totalGames: number;
    wins: number;
  },
) {
  return {
    ...user,
    totalGames: stats.totalGames,
    wins: stats.wins,
  };
}

export function toMyProfileUser(
  user: MyProfileUser,
  stats: {
    totalGames: number;
    wins: number;
  },
) {
  return {
    ...user,
    totalGames: stats.totalGames,
    wins: stats.wins,
  };
}
