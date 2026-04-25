import { Avatar, Button, Icon, Section } from "components";

import type { ProfileUser } from "types/profile";

import s from "./UserSection.module.css";

interface Props {
  user: ProfileUser;
}

const UserSection = ({ user }: Props) => {
  return (
    <Section className={s.section}>
      <Avatar className={s.avatar} variant="profile" src={user.avatarUrl} />
      <span className={s.name}>{user.username}</span>
      <Button className={s.editButton}>
        <Icon name="pencil" className={s.editIcon} width={15} height={15} />
      </Button>
      <Button className={s.logoutButton}>
        <Icon name="log-out" className={s.logoutIcon} width={15} height={15} />
        <span className={s.logoutText}>Sign out</span>
      </Button>
    </Section>
  );
};

export default UserSection;
