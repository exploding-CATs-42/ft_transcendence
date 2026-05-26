// Project level
import { Button, Icon, Input, Modal } from "components";

// Local level
import s from "./JoinGameModal.module.css";

interface Props {
  isOpen: boolean;
  gameId: string;
  toggleModal: (isOpen?: boolean) => void;
  onGameIdChange: (value: string) => void;
  onJoin: () => void;
}

const JoinGameModal = ({
  isOpen,
  gameId,
  toggleModal,
  onGameIdChange,
  onJoin,
}: Props) => {
  return (
    <Modal className={s.joinModal} isOpen={isOpen} toggleModal={toggleModal}>
      <div className={s.joinModalContent}>
        <h2 className={s.modalTitle}>Join table</h2>

        <Input
          className={s.modalInput}
          type="text"
          value={gameId}
          onChange={(event) => onGameIdChange(event.target.value)}
          pdLeft={true}
          placeholder="Table id"
        >
          <Icon
            className={s.icon}
            name="puzzle"
            id="puzzle"
            stroke="currentColor"
            width={18}
            height={18}
          />
        </Input>

        <Button className={s.joinButton} onClick={onJoin}>
          Join
        </Button>

        <p className={s.createText}>Want to create a room?</p>

        <button className={s.createLink} type="button">
          Create a new one
        </button>
      </div>
    </Modal>
  );
};

export default JoinGameModal;