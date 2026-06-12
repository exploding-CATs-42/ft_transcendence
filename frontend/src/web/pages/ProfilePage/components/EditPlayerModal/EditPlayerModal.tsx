import { useRef, useState } from "react";
import type {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";

import {
  Button,
  EmailInput,
  FormField,
  Input,
  Modal,
  NameInput,
  PasswordInput,
} from "components";
import s from "./EditPlayerModal.module.css";
import type { UpdateMeRequestBody } from "schemas/me/updateMeSchema";
import clsx from "clsx";
import AvatarWithAdd from "components/AvatarWithAdd/AvatarWithAdd";
import type { MyProfileUser } from "pages/ProfilePage/types";
import api from "api";

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  user: MyProfileUser;
  updateUserAvatar: (avatarUrl: string) => void;
  form: {
    onSubmit: () => void;
    disabled: boolean;
    errors: FieldErrors<UpdateMeRequestBody>;
    register: UseFormRegister<UpdateMeRequestBody>;
    clearErrors: UseFormClearErrors<UpdateMeRequestBody>;
    watch: UseFormWatch<UpdateMeRequestBody>;
    setValue: UseFormSetValue<UpdateMeRequestBody>;
    isDirty: boolean;
  };
}

const EditPlayerModal = ({ isOpen, toggleModal, user, form }: Props) => {
  const [isProfileUpdate, setIsProfileUpdate] = useState(true);
  const { onSubmit, errors, register, disabled, clearErrors, isDirty } = form;

  const formTitle = isProfileUpdate ? "Profile Settings" : "Password Settings";
  const redirectText = isProfileUpdate ? "change password" : "update profile";

  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(user.avatarUrl);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await api.me.updateMeAvatar(formData);
    console.log(res.id);
  }

  return (
    <Modal
      className={s.editPlayerModal}
      isOpen={isOpen}
      toggleModal={toggleModal}
    >
      <form className={s.editPlayerForm} onSubmit={onSubmit}>
        <h2 className={s.modalTitle}>{formTitle}</h2>

        {isProfileUpdate ? (
          <>
            <AvatarWithAdd
              src={previewUrl}
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
          disabled={disabled || !isDirty}
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
