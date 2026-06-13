// Libraries
import clsx from "clsx";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useForm, type SubmitHandler } from "react-hook-form";
// Project level
import {
  Button,
  EmailInput,
  FormField,
  Input,
  Modal,
  NameInput,
  PasswordInput,
} from "components";
import type { MyProfileUser, ProfileUser } from "pages/ProfilePage/types";
import type { BadRequestErrorResponse } from "types";
import type { AxiosError } from "axios";
import api from "api";
// Local level
import s from "./EditPlayerModal.module.css";
import { AvatarWithAdd } from "components";
import type { UpdateMeRequestBody } from "schemas/me/updateMeSchema";
import { avatarSchema } from "schemas/me/updateMeAvatarSchema";
import { Spinner } from "assets";

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  user: MyProfileUser;
  updateUser: (updates: ProfileUser) => void;
}

const EditPlayerModal = ({ isOpen, toggleModal, user, updateUser }: Props) => {
  const [loading, setLoading] = useState(false);
  const [isProfileUpdate, setIsProfileUpdate] = useState(true);

  const formTitle = isProfileUpdate ? "Profile Settings" : "Password Settings";
  const redirectText = isProfileUpdate ? "change password" : "update profile";

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isDirty },
    setError,
    clearErrors,
    reset,
  } = useForm<UpdateMeRequestBody>({
    defaultValues: user,
  });

  const emptyStringToUndefined = (value: string | undefined) =>
    value === "" ? undefined : value;

  const valuesToUpdate = (data: UpdateMeRequestBody) => ({
    username: emptyStringToUndefined(data.username),
    email: emptyStringToUndefined(data.email),
    passwordNew: emptyStringToUndefined(data.passwordNew),
    passwordOld: emptyStringToUndefined(data.passwordOld),
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

      updateUser(updatedUser);
      reset(updatedUser);

      clearErrors();

      toast.success("Success");
    } catch (error) {
      handleRequestErrors(error);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    clearErrors();
    try {
      setLoading(true);

      const result = avatarSchema.safeParse(file);

      if (!result.success) {
        const { formErrors } = result.error.flatten();

        if (formErrors.length) {
          const message = formErrors?.[0];

          if (!message) return;

          setError("root", {
            type: "validate",
            message,
          });
        }

        return;
      }
      const formData = new FormData();
      formData.append("avatar", file);

      const newAvatarUrl = await api.me.updateMeAvatar(formData);
      const updatedUser = { ...user, avatarUrl: newAvatarUrl };

      updateUser(updatedUser);
    } catch (error) {
      handleRequestErrors(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      className={s.editPlayerModal}
      isOpen={isOpen}
      toggleModal={toggleModal}
    >
      <form className={s.editPlayerForm} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={s.modalTitle}>{formTitle}</h2>

        {isProfileUpdate ? (
          <>
            <AvatarWithAdd
              src={loading ? Spinner : user.avatarUrl}
              onClick={() => {
                inputRef.current?.click();
              }}
            />

            <Input
              ref={inputRef}
              type="file"
              hidden
              onChange={handleFileUpload}
            />

            <FormField error={errors.email?.message}>
              <EmailInput
                {...register("email")}
                status={errors.email ? "error" : "normal"}
              />
            </FormField>

            <FormField error={errors.username?.message}>
              <NameInput
                {...register("username")}
                status={errors.username ? "error" : "normal"}
              />
            </FormField>
          </>
        ) : (
          <>
            <FormField error={errors.passwordOld?.message}>
              <PasswordInput
                placeholder="Current password"
                {...register("passwordOld")}
                status={errors.passwordOld ? "error" : "normal"}
              />
            </FormField>

            <FormField error={errors.passwordNew?.message}>
              <PasswordInput
                placeholder="New password"
                {...register("passwordNew")}
                status={errors.passwordNew ? "error" : "normal"}
              />
            </FormField>
          </>
        )}
        {errors.root && <p>{errors.root.message}</p>}

        <Button
          className={clsx(
            s.editPlayerButton,
            isDirty && s.editFormButtonEnabled,
          )}
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          Save
        </Button>

        <Button
          className={s.changeFormButton}
          type="button"
          onClick={() => {
            setIsProfileUpdate((prev) => !prev);
            clearErrors();
          }}
        >
          Or you can <span className={s.underline}>{redirectText}</span>
        </Button>
      </form>
    </Modal>
  );
};

export default EditPlayerModal;
