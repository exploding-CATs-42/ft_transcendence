// Project level
import { Avatar, Button, Icon, Section } from "components";
// Local level
import s from "./UserSection.module.css";
import ProfileControls from "../ProfileControls/ProfileControls";
import type { MyProfileUser, ProfileUser } from "@exploding-cats/contracts";
import { toast } from "react-toastify";

type Props =
  | {
      isMyProfile: true;
      user: MyProfileUser;
      updateUser: (updates: Partial<MyProfileUser>) => void;
    }
  | {
      isMyProfile: false;
      user: ProfileUser;
      updateUser?: undefined;
    };

const UserSection = ({ user, updateUser, isMyProfile }: Props) => {
  function copyUserIdToClipboard() {
    navigator.clipboard.writeText(user.id);
    toast.success("User ID copied");
  }

  return (
    <Section className={s.section}>
      <Avatar
        className={s.avatar}
        variant="profile"
        src={user.avatarUrl}
        status={user.isOnline}
      />

      <div className={s.nameContainer}>
        <span className={s.username}>{user.username}</span>

        <Button className={s.copyButton} onClick={copyUserIdToClipboard}>
          <Icon name="copy" className={s.copyIcon} width={20} height={20} />
        </Button>
      </div>

      {isMyProfile && <ProfileControls user={user} updateUser={updateUser} />}
    </Section>
  );
};

export default UserSection;
