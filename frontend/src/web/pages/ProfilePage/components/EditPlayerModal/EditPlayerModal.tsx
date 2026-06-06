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

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  onSubmit: () => void;
  user: MyProfileUser;
}

const EditPlayerModal = ({ isOpen, toggleModal, onSubmit, user }: Props) => {
  return (
    <Modal
      className={s.editPlayerModal}
      isOpen={isOpen}
      toggleModal={toggleModal}
    >
      <form className={s.editPlayerForm}>
        <h2 className={s.modalTitle}> Profile Settings </h2>
        <Avatar className={s.avatar} variant="profile" src={user.avatarUrl} />

        <FormField>
          <EmailInput />
        </FormField>

        <FormField>
          <NameInput />
        </FormField>

        <FormField>
          <PasswordInput />
        </FormField>

        <FormField>
          <PasswordInput />
        </FormField>

        <Button
          className={s.editPlayerButton}
          onSubmit={() => {
            onSubmit();
          }}
        >
          Update user
        </Button>
      </form>
    </Modal>
  );
};

export default EditPlayerModal;
