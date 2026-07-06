import { MyProfileUser, ProfileUser, User, UserId } from "@exploding-cats/contracts";
import { isUserOnline } from "sockets/onlineUsers";

// Project level

export function toUserWithOnlineStatus<T extends { id: UserId }>(
  user: T,
): T & { isOnline: boolean } {
  return {
    ...user,
    isOnline: isUserOnline(user.id),
  };
}

export function toProfileUser(user: {
  id: string;
  username: string;
  avatarUrl: string | null;
}): ProfileUser {
  return toUserWithOnlineStatus({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
  });
}

export function toSelfProfileUser(user: {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
}): MyProfileUser {
  return toUserWithOnlineStatus({
    id: user.id,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatarUrl,
  });
}

export function toProfileUserWithStats(
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  },
  stats: {
    totalGames: number;
    wins: number;
  },
) {
  return toUserWithOnlineStatus({
    ...user,
    totalGames: stats.totalGames,
    wins: stats.wins,
  });
}

export function toMyProfileUser(
  user: User,
  stats: {
    totalGames: number;
    wins: number;
  },
) {
  return toUserWithOnlineStatus({
    ...user,
    totalGames: stats.totalGames,
    wins: stats.wins,
  });
}
