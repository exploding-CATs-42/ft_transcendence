import { useMemo, useState } from "react";
import { Button, FormField, Icon, Input, Modal } from "components";
import { FireCat } from "../../../../assets/images";
import s from "./CreateTableModal.module.css";

export type CreateTableFormValues = {
  gameName: string;
  maxPlayers: number;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTableFormValues) => Promise<void>;
}

const DEFAULT_MAX_PLAYERS = 5;

const CreateTableModal = ({ isOpen, onClose, onSubmit }: Props) => {
  const [gameName, setGameName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_MAX_PLAYERS);
  const [isMaxPlayersSelected, setIsMaxPlayersSelected] = useState(false);
  const [nameError, setNameError] = useState("");
  const [maxPlayersError, setMaxPlayersError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountOptions = useMemo(() => [2, 3, 4, 5], []);

  const resetForm = () => {
    setGameName("");
    setMaxPlayers(DEFAULT_MAX_PLAYERS);
    setIsMaxPlayersSelected(false);
    setNameError("");
    setMaxPlayersError("");
    setSubmitError("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const validateGameName = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "Game name is required";
    if (trimmedValue.length < 3)
      return "Game name must be at least 3 characters";
    if (trimmedValue.length > 30)
      return "Game name must be at most 30 characters";

    return "";
  };

  const getSubmitErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }

    return "Failed to create table. Please try again.";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedGameName = gameName.trim();
    const validationError = validateGameName(trimmedGameName);

    setNameError("");
    setMaxPlayersError("");
    setSubmitError("");

    if (validationError) {
      setNameError(validationError);
      setSubmitError(validationError);
      return;
    }

    if (!isMaxPlayersSelected) {
      const errorMessage = "Please select the amount of players";

      setMaxPlayersError(errorMessage);
      setSubmitError(errorMessage);
      return;
    }

    if (maxPlayers < 2 || maxPlayers > 5) {
      const errorMessage = "Amount of players must be between 2 and 5";

      setMaxPlayersError(errorMessage);
      setSubmitError(errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        gameName: trimmedGameName,
        maxPlayers,
      });

      resetForm();
      onClose();
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal className={s.modal} isOpen={isOpen} toggleModal={handleClose}>
      <form className={s.form} onSubmit={handleSubmit}>
        <img
          className={s.backgroundImage}
          src={FireCat}
          alt=""
          aria-hidden="true"
        />
        <div className={s.overlay} />

        <div className={s.content}>
          <h2 className={s.title}>Create table</h2>

          <FormField>
            <div className={s.inputWrapper}>
              <Input
                className={s.textInput}
                type="text"
                pdLeft={true}
                placeholder="Table name"
                value={gameName}
                status={nameError ? "error" : "normal"}
                maxLength={30}
                onChange={(event) => {
                  setGameName(event.target.value);
                  setNameError("");
                  setSubmitError("");
                }}
              >
                <span className={s.inputIcon} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    className={s.puzzleIcon}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 2.5C14.8807 2.5 16 3.61929 16 5C16 5.32608 15.9375 5.63757 15.8238 5.92322H18.5C19.3284 5.92322 20 6.59479 20 7.42322V10.0994C19.7143 9.98571 19.4029 9.92322 19.0768 9.92322C17.6961 9.92322 16.5768 11.0425 16.5768 12.4232C16.5768 13.8039 17.6961 14.9232 19.0768 14.9232C19.4029 14.9232 19.7143 14.8607 20 14.747V17.5C20 18.3284 19.3284 19 18.5 19H15.747C15.8607 18.7143 15.9232 18.4029 15.9232 18.0768C15.9232 16.6961 14.8039 15.5768 13.4232 15.5768C12.0425 15.5768 10.9232 16.6961 10.9232 18.0768C10.9232 18.4029 10.9857 18.7143 11.0994 19H8.42322C7.59479 19 6.92322 18.3284 6.92322 17.5V14.8238C6.63757 14.9375 6.32608 15 6 15C4.61929 15 3.5 13.8807 3.5 12.5C3.5 11.1193 4.61929 10 6 10C6.32608 10 6.63757 10.0625 6.92322 10.1762V7.42322C6.92322 6.59479 7.59479 5.92322 8.42322 5.92322H11.1762C11.0625 5.63757 11 5.32608 11 5C11 3.61929 12.1193 2.5 13.5 2.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </Input>
            </div>
          </FormField>

          <div
            className={s.selectField}
            data-status={maxPlayersError ? "error" : "normal"}
          >
            <span className={s.inputIcon} aria-hidden="true">
              <Icon className={s.userIcon} name="user" width={24} height={24} />
            </span>

            <select
              className={s.select}
              value={isMaxPlayersSelected ? String(maxPlayers) : ""}
              onChange={(event) => {
                setMaxPlayers(Number(event.target.value));
                setIsMaxPlayersSelected(true);
                setMaxPlayersError("");
                setSubmitError("");
              }}
              disabled={isSubmitting}
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
            <span className={s.selectArrowWrapper} aria-hidden="true">
              <span className={s.selectArrow} />
            </span>
          </div>

          {submitError && <p className={s.submitError}>{submitError}</p>}

          <Button
            className={s.submitButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>

          <div className={s.footer}>
            <span className={s.footerText}>Don’t want to create a room?</span>
            <button
              className={s.joinButton}
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Join an existing one
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTableModal;
