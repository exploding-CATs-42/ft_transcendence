import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "api";
import { getErrorMessage } from "utils";

import { ListSection, StatsSection, UserSection } from "./components";
import { statsMock } from "./mocks";

import type { ProfileUser, FriendItem } from "./types";
import s from "./ProfilePage.module.css";
import type { UserGameHistoryItem } from "components/MatchListItem/types";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [matches, setMatches] = useState<UserGameHistoryItem[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userData = await api.me.getMe();
        setUser(userData);

        const friendsData = await api.me.getMeFriends();
        setFriends(friendsData);

        if (user) {
          const matchesData = await api.users.getLastMatches(user?.id);
          setMatches(matchesData);
        }
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
      <ListSection matches={matches} friends={friends} />
    </div>
  );
};

export default ProfilePage;
