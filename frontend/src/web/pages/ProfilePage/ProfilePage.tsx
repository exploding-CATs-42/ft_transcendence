import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "api";

import { ListSection, StatsSection, UserSection } from "./components";
import { friendsMock, matchesMock, statsMock } from "./mocks";

import type { ProfileUser } from "./types/ProfileUser";
import s from "./ProfilePage.module.css";
import { toast } from "react-toastify";
import { getErrorMessage } from "utils";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<ProfileUser | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await api.me.getMe();

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
      <ListSection matches={matchesMock} friends={friendsMock} />
    </div>
  );
};

export default ProfilePage;
