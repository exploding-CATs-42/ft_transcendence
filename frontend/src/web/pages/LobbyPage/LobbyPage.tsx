// Libraries
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

// Project level
import { Section, Button, List, MatchListItem } from "components";
import { useModal } from "hooks";
import type { LobbyMatch } from "types";

// Local level
import { JoinGameModal } from "./components/JoinGameModal";
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

      <JoinGameModal
        isOpen={isOpenJoinModal}
        gameId={gameId}
        toggleModal={toggleJoinModal}
        onGameIdChange={setGameId}
        onJoin={handleJoinGame}
      />
    </div>
  );
};

export default LobbyPage;