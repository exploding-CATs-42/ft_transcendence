//Libraries
import { useMemo } from "react";
import { useLocation, Navigate, useParams } from "react-router-dom";
//Project level
import { useFriends, useGames, useProfile, useUser } from "hooks";
import { LoadingScreen } from "../../components";
//Local level
import { ListSection, StatsSection, UserSection } from "./components";
import { buildStats } from "./utils";
import s from "./ProfilePage.module.css";

const ProfilePage = () => {
  const { userId } = useParams();
  const { pathname } = useLocation();
  const isMyProfile = pathname === "/profile";

  const { friends, friendsLoading, setFriends } = useFriends({
    userId,
    isMyProfile,
  });
  const { games, gamesLoading } = useGames({ userId, isMyProfile });
  const { user, userLoading } = useUser({ userId, isMyProfile });
  const { profile, updateProfile } = useProfile();

  const loading = friendsLoading || gamesLoading || userLoading;

  const stats = useMemo(() => {
    return user ? buildStats(user) : [];
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={s.pageContainer}>
      <div className={s.flexContainer}>
        {isMyProfile && profile ? (
          <UserSection
            isMyProfile={true}
            user={profile}
            updateUser={updateProfile}
          />
        ) : (
          <UserSection isMyProfile={false} user={user} />
        )}

        <StatsSection stats={stats} />
      </div>

      <ListSection
        games={games}
        friends={friends}
        setFriends={setFriends}
        isMyProfile={isMyProfile}
      />
    </div>
  );
};

export default ProfilePage;
