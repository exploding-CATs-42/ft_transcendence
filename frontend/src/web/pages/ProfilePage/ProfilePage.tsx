import { useEffect, useState } from "react";
import { useLocation, Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";

import { ListSection, StatsSection, UserSection } from "./components";

import type {
  ProfileUser,
  FriendItem,
  ProfileStat,
  MyProfileUser,
} from "./types";
import s from "./ProfilePage.module.css";
import type { UserGameHistoryItem } from "components/GameListItem/types";
import { buildStats } from "./utils/buildStats";
import LoadingScreen from "components/LoadingScreen/LoadingScreen";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<ProfileUser | MyProfileUser | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [games, setGames] = useState<UserGameHistoryItem[]>([]);
  const [stats, setStats] = useState<ProfileStat[]>([]);

  const { userId } = useParams();
  const { pathname } = useLocation();
  const isMyProfile = pathname === "/profile";

  useEffect(() => {
    async function getUserData(): Promise<ProfileUser | MyProfileUser | null> {
      if (isMyProfile) {
        return api.me.getMe();
      }

      if (userId) {
        return api.users.getUserById(userId);
      }
      return null;
    }

    async function getUserFriends(): Promise<FriendItem[]> {
      if (isMyProfile) {
        return api.friends.getMeFriends();
      }

      if (userId) {
        return api.friends.getUserFriends(userId);
      }
      return [];
    }

    async function getUserGames(): Promise<UserGameHistoryItem[]> {
      if (isMyProfile) {
        return api.me.getMeGames();
      }

      if (userId) {
        return api.users.getUserGames(userId);
      }
      return [];
    }

    async function loadProfile() {
      try {
        const [userData, friendsData, gamesData] = await Promise.all([
          getUserData(),
          getUserFriends(),
          getUserGames(),
        ]);

        if (!userData || !friendsData || !gamesData) {
          throw new Error("Invalid request");
        }

        setUser(userData);
        setFriends(friendsData);
        setGames(gamesData);

        setStats(buildStats(userData.id, gamesData));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setUser(null);
        toast(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId, isMyProfile]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const updateUser = (updates: ProfileUser) => {
    setUser((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        ...updates,
      };
    });
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.flexContainer}>
        {isMyProfile ? (
          <UserSection
            isMyProfile={true}
            user={user as MyProfileUser}
            updateUser={updateUser}
          />
        ) : (
          <UserSection isMyProfile={false} user={user} />
        )}

        <StatsSection stats={stats} />
      </div>

      <ListSection games={games} friends={friends} />
    </div>
  );
};

export default ProfilePage;
