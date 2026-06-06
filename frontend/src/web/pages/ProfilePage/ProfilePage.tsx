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
import type { UserGameHistoryItem } from "components/MatchListItem/types";
import { buildStats } from "./utils/buildStats";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<ProfileUser | MyProfileUser | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [matches, setMatches] = useState<UserGameHistoryItem[]>([]);
  const [stats, setStats] = useState<ProfileStat[]>([]);

  const { userId } = useParams();
  const { pathname } = useLocation();
  const isMyProfile = pathname === "/profile";

  async function getUserData(): Promise<ProfileUser | MyProfileUser | null> {
    if (isMyProfile) {
      return api.me.getMe();
    }

    if (userId) {
      return api.users.getUserById(userId);
    }
    return null;
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await getUserData();

        if (!userData) return;
        setUser(userData);

        const friendsData = await api.me.getMeFriends();
        setFriends(friendsData);

        const matchesData = await api.users.getUserGames(userData.id);
        setMatches(matchesData);
        setStats(buildStats(userData.id, matchesData));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId, isMyProfile]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={s.pageContainer}>
      <div className={s.flexContainer}>
        {isMyProfile ? (
          <UserSection isMyProfile={true} user={user as MyProfileUser} />
        ) : (
          <UserSection isMyProfile={false} user={user as ProfileUser} />
        )}

        <StatsSection stats={stats} />
      </div>

      <ListSection matches={matches} friends={friends} />
    </div>
  );
};

export default ProfilePage;
