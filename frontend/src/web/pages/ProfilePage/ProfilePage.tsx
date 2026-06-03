import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";

import { ListSection, StatsSection, UserSection } from "./components";
import { matchesMock, statsMock } from "./mocks";

import type { ProfileUser, FriendItem } from "./types";
import s from "./ProfilePage.module.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await api.me.getMe();
        const friendsData = await api.me.getMeFriends();

        setFriends(friendsData);
        setUser(userData);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast(errorMessage);

        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={s.pageContainer}>
      <div className={s.flexContainer}>
        <UserSection user={user} />
        <StatsSection stats={statsMock} />
      </div>
      <ListSection matches={matchesMock} friends={friends} />
    </div>
  );
};

export default ProfilePage;
