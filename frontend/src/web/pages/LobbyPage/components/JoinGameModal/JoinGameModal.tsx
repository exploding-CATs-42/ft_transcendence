// Project level
import { Button, Input, Modal } from "components";

// Local level
import s from "./JoinGameModal.module.css";

interface Props {
  isOpen: boolean;
  gameId: string;
  toggleModal: () => void;
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
    <Modal
      className={s["joinModal"]!}
      isOpen={isOpen}
      toggleModal={toggleModal}
    >
      <div className={s["joinModalContent"]!}>
        <h2 className={s["modalTitle"]!}>Join table</h2>

        <Input
          className={s["modalInput"]!}
          type="text"
          value={gameId}
          onChange={(event) => onGameIdChange(event.target.value)}
          iconName="puzzle"
          iconClassName={s.icon}
          placeholder="Table id"
        />

        <Button className={s["joinButton"]!} onClick={onJoin}>
          Join
        </Button>

        <p className={s["createText"]!}>Want to create a room?</p>

        <button className={s["createLink"]!} type="button">
          Create a new one
        </button>
      </div>
    </Modal>
  );
};

export default JoinGameModal;
