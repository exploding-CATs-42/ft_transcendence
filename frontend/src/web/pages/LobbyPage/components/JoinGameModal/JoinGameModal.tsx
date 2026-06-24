import { useState } from "react";
// Project level
import { Button, Input, Modal } from "components";

// Local level
import s from "./JoinGameModal.module.css";

interface Props {
  isOpen: boolean;
  gameId: string;
  toggleModal: () => void;
  onGameIdChange: (value: string) => void;
  onJoin: () => Promise<void>;
}

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getTableIdValidationError = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "Please enter a table id";
  if (!UUID_REGEX.test(trimmedValue)) return "Please enter a valid table id";

  return "";
};

const getJoinErrorMessage = (error: unknown) => {
  const apiError = error as ApiError;
  const status = apiError.response?.status;

  if (status === 404) return "Table was not found";
  if (status === 409) return "You already have an active or waiting game";

  return "Failed to join table. Please check the table id and try again.";
};

const JoinGameModal = ({
  isOpen,
  gameId,
  toggleModal,
  onGameIdChange,
  onJoin,
}: Props) => {
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;

    setSubmitError("");
    toggleModal();
  };

  const handleGameIdChange = (value: string) => {
    onGameIdChange(value);
    setSubmitError("");
  };

  const handleJoin = async () => {
    const validationError = getTableIdValidationError(gameId);

    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onJoin();
    } catch (error) {
      setSubmitError(getJoinErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className={s["joinModal"]!}
      isOpen={isOpen}
      toggleModal={handleClose}
    >
      <div className={s["joinModalContent"]!}>
        <h2 className={s["modalTitle"]!}>Join table</h2>

        <Input
          className={s["modalInput"]!}
          type="text"
          value={gameId}
          onChange={(event) => handleGameIdChange(event.target.value)}
          iconName="puzzle"
          iconClassName={s["icon"]!}
          placeholder="Table id"
          disabled={isSubmitting}
        />

        {submitError && <p className={s["submitError"]!}>{submitError}</p>}

        <Button
          className={s["joinButton"]!}
          onClick={handleJoin}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Joining..." : "Join"}
        </Button>

        <p className={s["createText"]!}>Want to create a room?</p>

        <button
          className={s["createLink"]!}
          type="button"
          disabled={isSubmitting}
        >
          Create a new one
        </button>
      </div>
    </Modal>
  );
};

export default JoinGameModal;
