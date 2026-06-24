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
  Modal,
  NameInput,
  PasswordInput,
  AvatarWithAdd,
} from "components";

import type { BadRequestErrorResponse } from "types";
import type { AxiosError } from "axios";

import api from "api";

import {
  avatarSchema,
  type UpdateMeRequestBody,
} from "@exploding-cats/contracts";

import { Spinner } from "assets";

// Local level
import type { MyProfileUser, ProfileUser } from "../../types";
import s from "./EditPlayerModal.module.css";

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  user: MyProfileUser;
  updateUser: (updates: ProfileUser) => void;
}

const ModalView = {
  PROFILE: "profile",
  PASSWORD: "password",
} as const;

type ModalView = (typeof ModalView)[keyof typeof ModalView];

const EditPlayerModal = ({ isOpen, toggleModal, user, updateUser }: Props) => {
  const [loading, setLoading] = useState(false);
  const [modalView, setModalView] = useState<ModalView>(ModalView.PROFILE);

  const formTitle =
    modalView === ModalView.PROFILE ? "Profile Settings" : "Password Settings";
  const redirectText =
    modalView === ModalView.PROFILE ? "change password" : "update profile";

  const getNextModalView = (view: ModalView): ModalView =>
    view === ModalView.PROFILE ? ModalView.PASSWORD : ModalView.PROFILE;

  const toggleModalView = () => {
    setModalView(getNextModalView(modalView));
  };

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

  const onSubmit: SubmitHandler<UpdateMeRequestBody> = async ({
    username,
    email,
    passwordOld,
    passwordNew,
  }) => {
    try {
      const updateData = {
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(passwordNew !== undefined && { passwordNew }),
        ...(passwordOld !== undefined && { passwordOld }),
      };

      const updatedUser = await api.me.updateMe(updateData);

      updateUser(updatedUser);
      reset(updateData);
      clearErrors();

      toggleModal();
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

        {modalView === ModalView.PROFILE ? (
          <>
            <AvatarWithAdd
              src={loading ? Spinner : user.avatarUrl}
              onClick={() => {
                inputRef.current?.click();
              }}
            />

            <input
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
            toggleModalView();
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
