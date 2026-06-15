import { useEffect, useState } from "react";
import { useLocation, Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";
import { useFriends, useGames } from "hooks";
import { LoadingScreen } from "components";

import type { ProfileUser, ProfileStat, MyProfileUser } from "./types";
import s from "./ProfilePage.module.css";
import { ListSection, StatsSection, UserSection } from "./components";
import { buildStats } from "./utils/buildStats";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<ProfileUser | MyProfileUser | null>(null);
  const [stats, setStats] = useState<ProfileStat[]>([]);

  const { userId } = useParams();
  const { pathname } = useLocation();
  const isMyProfile = pathname === "/profile";

  const { friends } = useFriends({ userId, isMyProfile });
  const { games } = useGames({ userId, isMyProfile });

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

    async function loadProfile() {
      try {
        const [userData] = await Promise.all([getUserData()]);

        if (!userData) {
          throw new Error("Invalid request");
        }

        setUser(userData);

        setStats(buildStats(userData.id, games));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setUser(null);
        toast(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId, isMyProfile, games]);

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
