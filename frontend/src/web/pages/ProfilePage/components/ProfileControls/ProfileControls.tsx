import api from "api";
import { useAuth, useModal } from "hooks";
import { Button, Icon } from "components";

import type { MyProfileUser, ProfileUser } from "../../types";
import { EditPlayerModal } from "../../components";

import s from "./ProfileControls.module.css";

type Props = {
  user: MyProfileUser;
  updateUser: (updates: ProfileUser) => void;
};

const ProfileControls = ({ user, updateUser }: Props) => {
  const [isOpenEditPlayerModal, toggleOpenEditPlayerModal] = useModal();
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
    <>
      <Button
        className={s.editButton}
        onClick={() => {
          toggleOpenEditPlayerModal(true);
        }}
      >
        <Icon name="pencil" className={s.editIcon} width={15} height={15} />
      </Button>

      <EditPlayerModal
        isOpen={isOpenEditPlayerModal}
        toggleModal={() => toggleOpenEditPlayerModal(false)}
        updateUser={updateUser}
        user={user}
      />

      <Button className={s.logoutButton} onClick={logoutUser}>
        <Icon name="log-out" className={s.logoutIcon} width={15} height={15} />
        <span className={s.logoutText}>Sign out</span>
      </Button>
    </>
  );
};

export default ProfileControls;
