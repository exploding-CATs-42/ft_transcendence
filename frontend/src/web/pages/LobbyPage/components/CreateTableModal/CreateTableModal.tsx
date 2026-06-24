import { useMemo, useState } from "react";
import { Button, Icon, Input, Modal } from "components";
import s from "./CreateTableModal.module.css";

export type CreateTableFormValues = {
  gameName: string;
  maxPlayers: number;
};

interface Props {
  isOpen: boolean;
  toggleModal: () => void;
  onSubmit: (values: CreateTableFormValues) => Promise<void>;
  onJoinClick: () => void;
}

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;

const CreateTableModal = ({
  isOpen,
  toggleModal,
  onSubmit,
  onJoinClick,
}: Props) => {
  const [gameName, setGameName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountOptions = useMemo(
    () =>
      Array.from(
        { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
        (_, index) => MIN_PLAYERS + index,
      ),
    [],
  );

  const resetForm = () => {
    setGameName("");
    setMaxPlayers(null);
    setSubmitError("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    resetForm();
    toggleModal();
  };

  const handleJoinClick = () => {
    if (isSubmitting) return;

    resetForm();
    onJoinClick();
  };

  const getGameNameValidationError = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "Please enter a table name";
    if (trimmedValue.length < 3) {
      return "Table name must be at least 3 characters";
    }
    if (trimmedValue.length > 30) {
      return "Table name must be at most 30 characters";
    }

    return "";
  };

  const getSubmitErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Failed to create table. Please try again.";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedGameName = gameName.trim();
    const gameNameValidationError = getGameNameValidationError(trimmedGameName);

    setSubmitError("");

    if (gameNameValidationError) {
      setSubmitError(gameNameValidationError);
      return;
    }

    if (!maxPlayers) {
      setSubmitError("Please select the amount of players");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        gameName: trimmedGameName,
        maxPlayers,
      });

      resetForm();
      toggleModal();
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className={s["createModal"]!}
      isOpen={isOpen}
      toggleModal={handleClose}
    >
      <form className={s["createModalContent"]!} onSubmit={handleSubmit}>
        <h2 className={s["modalTitle"]!}>Create table</h2>

        <Input
          className={s["modalInput"]!}
          type="text"
          value={gameName}
          onChange={(event) => {
            setGameName(event.target.value);
            setSubmitError("");
          }}
          iconName="puzzle"
          iconClassName={s["icon"]!}
          placeholder="Table name"
          maxLength={30}
          disabled={isSubmitting}
        />

        <div
          className={s["selectField"]!}
          data-status={submitError && !maxPlayers ? "error" : "normal"}
        >
          <Icon
            className={s["icon"]!}
            name="user"
            id="user"
            stroke="currentColor"
            width={18}
            height={18}
          />

          <select
            className={s["modalSelect"]!}
            value={maxPlayers ?? ""}
            onChange={(event) => {
              setMaxPlayers(Number(event.target.value));
              setSubmitError("");
            }}
            disabled={isSubmitting}
            required
          >
            <option value="" disabled>
              Amount of players
            </option>

            {amountOptions.map((playersAmount) => (
              <option key={playersAmount} value={playersAmount}>
                {playersAmount}
              </option>
            ))}
          </select>

          <span className={s["selectArrowWrapper"]!} aria-hidden="true">
            <span className={s["selectArrow"]!} />
          </span>
        </div>

        {submitError && <p className={s["submitError"]!}>{submitError}</p>}

        <Button
          className={s["createButton"]!}
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create"}
        </Button>

        <p className={s["joinText"]!}>Don’t want to create a room?</p>

        <button
          className={s["joinLink"]!}
          type="button"
          onClick={handleJoinClick}
          disabled={isSubmitting}
        >
          Join an existing one
        </button>
      </form>
    </Modal>
  );
};

export default CreateTableModal;
