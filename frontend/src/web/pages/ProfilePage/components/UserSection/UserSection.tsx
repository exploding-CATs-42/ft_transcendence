// Project level
import { Avatar, Button, Icon, Section } from "components";
import { useAuth } from "hooks";
import api from "api";
// Local level
import type { ProfileUser } from "../../types";
import s from "./UserSection.module.css";

interface Props {
  user: ProfileUser;
}

const UserSection = ({ user }: Props) => {
  const { clearAccessToken } = useAuth();

  const logoutUser = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Logout is best-effort because the backend session may already be gone.
    } finally {
      clearAccessToken();
    }
  };

  return (
    <Section className={s.section}>
      <Avatar className={s.avatar} variant="profile" src={user.avatarUrl} />
      <span className={s.name}>{user.username}</span>
      <Button className={s.editButton}>
        <Icon name="pencil" className={s.editIcon} width={15} height={15} />
      </Button>
      <Button className={s.logoutButton} onClick={logoutUser}>
        <Icon name="log-out" className={s.logoutIcon} width={15} height={15} />
        <span className={s.logoutText}>Sign out</span>
      </Button>
    </Section>
  );
};

export default UserSection;
