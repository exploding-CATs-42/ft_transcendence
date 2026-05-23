// Libraries
import { useState } from "react";
import clsx from "clsx";
// Project level
import { Section, Button, List, MatchListItem, Modal, Icon } from "components";
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
          renderItem={(match) => <MatchListItem match={match} />}
          className={s.list}
        />

        <div className={s.buttons}>
          <Button className={s.button}>Create table</Button>

          <Button
            className={clsx(s.button, s.color)}
            onClick={() => toggleJoinModal()}
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

        <div className={s.inputWrapper}>
          <input
            className={s.modalInput}
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            placeholder="Table id"
          />
          <Icon className={s.puzzleIcon} name="puzzle" width={24} height={24} />
        </div>

        <Button className={s.joinButton} onClick={handleJoinGame}>
          Join
        </Button>

        <p className={s.createText}>Want to create a room?</p>

        <button className={s.createLink} type="button">
          Create a new one
        </button>
      </Modal>
    </div>
  );
};

export default LobbyPage;
