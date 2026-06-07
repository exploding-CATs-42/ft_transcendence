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
import type { MyProfileUser } from "pages/ProfilePage/types";
import type { UpdateMeRequestBody } from "schemas/updateMeSchema";
import type { UseFormRegister } from "react-hook-form";

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  onSubmit: () => void;
  user: MyProfileUser;
  register: UseFormRegister<UpdateMeRequestBody>;
}

const EditPlayerModal = ({
  isOpen,
  toggleModal,
  onSubmit,
  user,
  register,
}: Props) => {
  return (
    <Modal
      className={s.editPlayerModal}
      isOpen={isOpen}
      toggleModal={toggleModal}
    >
      <form className={s.editPlayerForm} onSubmit={onSubmit}>
        <h2 className={s.modalTitle}> Profile Settings </h2>
        <Avatar className={s.avatar} variant="profile" src={user.avatarUrl} />

        <FormField>
          <EmailInput {...register("email")} />
        </FormField>

        <FormField>
          <NameInput {...register("username")} />
        </FormField>

        <FormField>
          <PasswordInput {...register("passwordOld")} />
        </FormField>

        <FormField>
          <PasswordInput {...register("passwordNew")} />
        </FormField>

        <Button className={s.editPlayerButton} type="submit">
          Update user
        </Button>
      </form>
    </Modal>
  );
};

export default EditPlayerModal;
