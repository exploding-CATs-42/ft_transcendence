import { useModal } from "hooks";
import { Button, Modal } from "components";

import s from "./ConfirmPopup.module.css";

const ConfirmPopup = () => {
  const [isOpenModal, toggleModal] = useModal();

  return (
    <>
      <button type="button" onClick={() => toggleModal()}>
        Open modal
      </button>

      <Modal className={s.modal} isOpen={isOpenModal} toggleModal={toggleModal}>
        <p className={s.question}>Do you really want to leave?</p>
        <div className={s.buttonsContainer}>
          <Button className={s.button}>Yes</Button>
          <Button className={s.button} onClick={() => toggleModal()}>
            No
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ConfirmPopup;
