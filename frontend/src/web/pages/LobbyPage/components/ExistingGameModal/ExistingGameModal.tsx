import { Button, Modal } from "components";
import s from "./ExistingGameModal.module.css";

interface Props {
  isOpen: boolean;
  gameName?: string | undefined;
  onReturn: () => void;
  onLeave: () => void | Promise<void>;
}

const ExistingGameModal = ({ isOpen, gameName, onReturn, onLeave }: Props) => {
  return (
    <Modal
      className={s["existingGameModal"]!}
      isOpen={isOpen}
      toggleModal={onLeave}
    >
      <div className={s["existingGameModalContent"]!}>
        <h2 className={s["modalTitle"]!}>Active game found</h2>

        <p className={s["modalText"]!}>
          You already have an active or waiting game
          {gameName ? ` "${gameName}"` : ""}. Do you want to return to it?
        </p>

        <div className={s["buttons"]!}>
          <Button className={s["returnButton"]!} onClick={onReturn}>
            Yes, return
          </Button>

          <Button className={s["cancelButton"]!} onClick={onLeave}>
            No, leave game
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExistingGameModal;
