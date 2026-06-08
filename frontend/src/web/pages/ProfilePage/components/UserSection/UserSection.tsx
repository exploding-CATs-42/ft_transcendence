import type { AxiosError } from "axios";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
// Project level
import { Avatar, Button, Icon, Section } from "components";
import type { UpdateMeRequestBody } from "schemas/updateMeSchema";
import type { BadRequestErrorResponse } from "types";
import { useAuth, useModal } from "hooks";
import api from "api";
// Local level
import { EditPlayerModal } from "../../components";
import type { MyProfileUser, ProfileUser } from "../../types";
import s from "./UserSection.module.css";
import type { Dispatch, SetStateAction } from "react";

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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    clearErrors,
  } = useForm<UpdateMeRequestBody>();

  const emptyToUndefined = (value: string | null | undefined) =>
    value === "" || value == null ? undefined : value;

  const valuesToUpdate = (data: UpdateMeRequestBody) => ({
    username: emptyToUndefined(data.username),
    email: emptyToUndefined(data.email),
    passwordNew: emptyToUndefined(data.passwordNew),
    passwordOld: emptyToUndefined(data.passwordOld),
    avatarUrl: emptyToUndefined(data.avatarUrl),
  });

  const processFieldErrors = (
    fieldErrors: Record<string, string[]> | undefined,
  ) => {
    if (!fieldErrors) return;

    Object.entries(fieldErrors).forEach(([field, messages]) => {
      const message = messages[0];

      if (!message) return;

      setError(field as keyof UpdateMeRequestBody, { message });
    });
  };

  const handleRequestErrors = (error: unknown) => {
    const err = error as AxiosError<
      BadRequestErrorResponse<keyof UpdateMeRequestBody>
    >;

    if (err.response?.status !== 400) {
      toast.error(err.message);
      return;
    }

    const formErrors = err.response.data.errors.formErrors;
    if (formErrors && formErrors[0]) {
      setError("root", {
        type: "server",
        message: formErrors[0],
      });
      return;
    }

    const fieldErrors = err.response.data.errors.fieldErrors;
    processFieldErrors(fieldErrors);
  };

  const onSubmit: SubmitHandler<UpdateMeRequestBody> = async (data) => {
    try {
      const updates = valuesToUpdate(data);
      const updatedUser = await api.me.updateMe(updates);

      if (setUser) setUser((p) => (p ? { ...p, ...updatedUser } : null));
      toast.success("Success");
    } catch (error) {
      handleRequestErrors(error);
    }
  };

  return (
    <Section className={s.section}>
      <Avatar className={s.avatar} variant="profile" src={user.avatarUrl} />
      <span className={s.name}>{user.username}</span>

      {isMyProfile && (
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
            user={user}
            form={{
              onSubmit: handleSubmit(onSubmit),
              disabled: isSubmitting,
              errors,
              register,
			  clearErrors
            }}
          />
        </>
      )}

      <Button className={s.logoutButton} onClick={logoutUser}>
        <Icon name="log-out" className={s.logoutIcon} width={15} height={15} />
        <span className={s.logoutText}>Sign out</span>
      </Button>
    </Section>
  );
};

export default UserSection;
