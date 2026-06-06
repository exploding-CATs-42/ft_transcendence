// Project level
import { Avatar, Button, Icon, Section } from "components";
import { useAuth, useModal } from "hooks";
import api from "api";
// Local level
import { EditPlayerModal } from "../../components";
import type { MyProfileUser, ProfileUser } from "../../types";
import s from "./UserSection.module.css";

type Props =
  | {
      isMyProfile: true;
      user: MyProfileUser;
    }
  | {
      isMyProfile: false;
      user: ProfileUser;
    };

const UserSection = ({ user, isMyProfile }: Props) => {
  const { clearAccessToken } = useAuth();
  const [isOpenEditPlayerModal, toggleOpenEditPlayerModal] = useModal();

  const logoutUser = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Logout is best-effort because the backend session may already be gone.
    } finally {
      clearAccessToken();
    }
  };

  const onSubmit = async () => {};

  return (
    <Section className={s.section}>
      <Avatar className={s.avatar} variant="profile" src={user.avatarUrl} />
      <span className={s.name}>{user.username}</span>

      {isMyProfile && (
        <Button
          className={s.editButton}
          onClick={() => {
            toggleOpenEditPlayerModal(true);
          }}
        >
          <Icon name="pencil" className={s.editIcon} width={15} height={15} />
        </Button>
      )}

      <Button className={s.logoutButton} onClick={logoutUser}>
        <Icon name="log-out" className={s.logoutIcon} width={15} height={15} />
        <span className={s.logoutText}>Sign out</span>
      </Button>

      {isMyProfile && (
        <EditPlayerModal
          isOpen={isOpenEditPlayerModal}
          toggleModal={() => toggleOpenEditPlayerModal(false)}
          onSubmit={() => {
            onSubmit();
          }}
          user={user}
        />
      )}
    </Section>
  );
};

export default UserSection;
