import { Button, Modal } from "components";
import s from "./EditPlayerModal.module.css";

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  onSubmit: () => void;
}

const EditPlayerModal = ({ isOpen, toggleModal, onSubmit }: Props) => {
  return (
    <Modal
      className={s.editPlayerModal}
      isOpen={isOpen}
      toggleModal={toggleModal}
    >
      <form>
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
