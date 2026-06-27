// Project level
import { Avatar, Section } from "components";
// Local level
import s from "./UserSection.module.css";
import ProfileControls from "../ProfileControls/ProfileControls";
import type { MyProfileUser, ProfileUser } from "@exploding-cats/contracts";

type Props =
  | {
      isMyProfile: true;
      user: MyProfileUser;
      updateUser: (updates: ProfileUser) => void;
    }
  | {
      isMyProfile: false;
      user: ProfileUser;
      updateUser?: undefined;
    };

const UserSection = ({ user, updateUser, isMyProfile }: Props) => {
  return (
    <Section className={s.section}>
      <Avatar className={s.avatar} variant="profile" src={user.avatarUrl} />
      <span className={s.name}>{user.username}</span>

      {isMyProfile && <ProfileControls user={user} updateUser={updateUser} />}
    </Section>
  );
};

export default UserSection;
