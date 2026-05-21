// Libraries
import { useState } from "react";
import clsx from "clsx";
// Project level
import { Section, Button, List, MatchListItem, Modal } from "components";
import { useModal } from "hooks";
import type { LobbyMatch } from "types";
import { useNavigate } from "react-router-dom";
// Local level
import { matchesMock } from "./mocks";
import s from "./LobbyPage.module.css";

const LobbyPage = () => {
  const matches: LobbyMatch[] = matchesMock;
  
  const navigate = useNavigate();

  const [isOpenJoinModal, toggleJoinModal] = useModal();
  const [gameId, setGameId] = useState("");

  const handleOpenJoinModal = (selectedGameId = "") => {
    setGameId(selectedGameId);
    toggleJoinModal(true);
  };

  const handleJoinGame = () => {
    const trimmedGameId = gameId.trim();

    if (!trimmedGameId) return;

    toggleJoinModal(false);
    navigate(`/game?gameId=${encodeURIComponent(trimmedGameId)}`);
  };

  return (
    <div className={s.pageContainer}>
      <Section className={s.listSection}>
        <List
          items={matches}
          getKey={(match) => match.id}
          renderItem={(match) => (
            <button
              type="button"
              className={s.matchButton}
              onClick={() => handleOpenJoinModal(match.id)}
            >
              <MatchListItem match={match} />
            </button>
        )}
          className={s.list}
      />

        <div className={s.buttons}>
          <Button className={s.button}>Create table</Button>

          <Button
            className={clsx(s.button, s.color)}
            onClick={() => handleOpenJoinModal()}
          >
            Join table
          </Button>
        </div>
      </Section>

      <Modal
        className={s.joinModal}
        isOpen={isOpenJoinModal}
        toggleModal={toggleJoinModal}
      >
        <h2 className={s.modalTitle}>Join table</h2>

        <label className={s.modalLabel}>
          Game ID
          <input
            className={s.modalInput}
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            placeholder="Enter game id"
          />
        </label>

        <div className={s.modalButtons}>
          <Button
            className={s.modalButton}
            onClick={() => toggleJoinModal(false)}
          >
            Cancel
          </Button>

          <Button
            className={clsx(s.modalButton, s.color)}
            onClick={handleJoinGame}
          >
            Join
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LobbyPage;