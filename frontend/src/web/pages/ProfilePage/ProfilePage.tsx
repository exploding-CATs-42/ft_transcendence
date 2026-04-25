import {
	ListSection,
	StatsSection,
	UserSection
} from "./components";

import { friendsMock, matchesMock, profileUserMock, statsMock } from "./mocks";

import s from "./ProfilePage.module.css";

const ProfilePage = () => {
  return (
    <div className={s.pageContainer}>
      <div className={s.flexContainer}>
        <UserSection user={profileUserMock} />
        <StatsSection stats={statsMock} />
      </div>
      <ListSection matches={matchesMock} friends={friendsMock} />
    </div>
  );
};

export default ProfilePage;
