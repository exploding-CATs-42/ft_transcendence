import { Button, Modal } from "components";
import s from "./ManageLobbyModal.module.css";

interface Props {
  isOpen: boolean;
  gameName?: string | undefined;
  isOwner: boolean;
  onCancel: () => void;
  onDeleteLobby: () => void;
  onLeaveLobby: () => void;
}

const ManageLobbyModal = ({
  isOpen,
  gameName,
  isOwner,
  onCancel,
  onDeleteLobby,
  onLeaveLobby,
}: Props) => {
  const actionLabel = isOwner ? "Delete lobby" : "Leave lobby";
  const actionHandler = isOwner ? onDeleteLobby : onLeaveLobby;

  return (
    <Modal
      className={s.manageLobbyModal}
      isOpen={isOpen}
      toggleModal={onCancel}
    >
      <div className={s.manageLobbyModalContent}>
        <h2 className={s.modalTitle}>Manage lobby</h2>

        <p className={s.modalText}>
          {isOwner
            ? `Do you want to delete${gameName ? ` "${gameName}"` : " this lobby"}?`
            : `Do you want to leave${gameName ? ` "${gameName}"` : " this lobby"}?`}
        </p>

        <div className={s.buttons}>
          <Button className={s.cancelButton} onClick={onCancel}>
            Cancel
          </Button>

          <Button className={s.actionButton} onClick={actionHandler}>
            {actionLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageLobbyModal;
