// Project level
import { Avatar, Button, Icon, Section } from "components";
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

      <div className={s.nameContainer}>
        <span>{user.username}</span>

        <Button>
          <Icon name="copy" className={s.copyIcon} width={15} height={15} />
        </Button>
      </div>

      {isMyProfile && <ProfileControls user={user} updateUser={updateUser} />}
    </Section>
  );
};

export default UserSection;
