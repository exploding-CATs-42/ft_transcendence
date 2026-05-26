// Libraries
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

// Project level
import {
  Section,
  Button,
  List,
  MatchListItem,
  Modal,
  Icon,
  Input,
} from "components";
import { useModal } from "hooks";
import type { LobbyMatch } from "types";

// Local level
import { matchesMock } from "./mocks";
import s from "./LobbyPage.module.css";

const LobbyPage = () => {
  const matches: LobbyMatch[] = matchesMock;

  const navigate = useNavigate();

  const [isOpenJoinModal, toggleJoinModal] = useModal();
  const [gameId, setGameId] = useState("");

  const handleOpenJoinModalWithGameId = (selectedGameId: string) => {
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
              onClick={() => handleOpenJoinModalWithGameId(match.id)}
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
        <div className={s.joinModalContent}>
          <h2 className={s.modalTitle}>Join table</h2>

          <Input
            className={s.modalInput}
            type="text"
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
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

          <Button className={s.joinButton} onClick={handleJoinGame}>
            Join
          </Button>

          <p className={s.createText}>Want to create a room?</p>

          <button className={s.createLink} type="button">
            Create a new one
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LobbyPage;
