import { useState } from "react";
import type {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
} from "react-hook-form";

import {
  Avatar,
  Button,
  EmailInput,
  FormField,
  Modal,
  NameInput,
  PasswordInput,
} from "components";
import s from "./EditPlayerModal.module.css";
import type { UpdateMeRequestBody } from "schemas/updateMeSchema";

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  user: UpdateMeRequestBody;
  form: {
    onSubmit: () => void;
    disabled: boolean;
    errors: FieldErrors<UpdateMeRequestBody>;
    register: UseFormRegister<UpdateMeRequestBody>;
    clearErrors: UseFormClearErrors<UpdateMeRequestBody>;
  };
}

const EditPlayerModal = ({ isOpen, toggleModal, user, form }: Props) => {
  const [isProfileUpdate, setIsProfileUpdate] = useState(true);
  const { onSubmit, errors, register, disabled, clearErrors } = form;

  const formTitle = isProfileUpdate ? "Profile Settings" : "Password Settings";
  const redirectText = isProfileUpdate ? "change password" : "update profile";

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
            <Avatar
              className={s.avatar}
              variant="profile"
              src={user.avatarUrl ? user.avatarUrl : null}
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
          className={s.editPlayerButton}
          type="submit"
          disabled={disabled}
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
