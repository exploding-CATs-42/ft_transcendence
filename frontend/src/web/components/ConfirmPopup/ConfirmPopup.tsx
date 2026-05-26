// Project level
import { Button, Modal } from "components";
// Local level
import s from "./ConfirmPopup.module.css";

interface Props {
  msg?: string;
  toggleModal: () => void;
  isOpenModal: boolean;
  onConfirm: () => void;
}

const ConfirmPopup = ({ msg, toggleModal, isOpenModal, onConfirm }: Props) => {
  return (
    <>
      <Modal className={s.modal} isOpen={isOpenModal} toggleModal={toggleModal}>
        <p className={s.question}>{msg}</p>
        <div className={s.buttonsContainer}>
          <Button className={s.button} onClick={onConfirm}>
            Yes
          </Button>
          <Button
            className={s.button}
            onClick={() => {
              toggleModal();
            }}
          >
            No
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmPopup;
