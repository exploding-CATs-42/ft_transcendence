import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import type { Dispatch, SetStateAction } from "react";
// Project level
import { Avatar, Button, Icon, Section } from "components";
import type { UpdateMeRequestBody } from "schemas/updateMeSchema";
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
      setUser: Dispatch<SetStateAction<ProfileUser | null>>;
    }
  | {
      isMyProfile: false;
      user: ProfileUser;
      setUser?: undefined;
    };

const UserSection = ({ user, setUser, isMyProfile }: Props) => {
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

  const { register, handleSubmit } = useForm<UpdateMeRequestBody>();

  const emptyToUndefined = (value: string | null | undefined) =>
    value === "" || value == null ? undefined : value;

  const valuesToUpdate = (data: UpdateMeRequestBody) => ({
    username: emptyToUndefined(data.username),
    email: emptyToUndefined(data.email),
    passwordNew: emptyToUndefined(data.passwordNew),
    passwordOld: emptyToUndefined(data.passwordOld),
    avatarUrl: emptyToUndefined(data.avatarUrl),
  });

  const onSubmit: SubmitHandler<UpdateMeRequestBody> = async (data) => {
    try {
      const updates = valuesToUpdate(data);
      console.log(updates);
      const updatedUser = await api.me.updateMe(updates);

      if (setUser) setUser((p) => (p ? { ...p, ...updatedUser } : null));
      toast.success("Success");
    } catch (error) {
      console.error(error);
    }
  };

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
          onSubmit={handleSubmit(onSubmit)}
          user={user}
          register={register}
        />
      )}
    </Section>
  );
};

export default UserSection;
