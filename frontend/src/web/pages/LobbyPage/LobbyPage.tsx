import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import api from "api";
import { Section, Button, List, MatchListItem } from "components";
import { useModal } from "hooks";
import type { LobbyMatch } from "types";
import {
  CreateTableModal,
  type CreateTableFormValues,
} from "./components/CreateTableModal";
import { JoinGameModal } from "./components/JoinGameModal";
import { matchesMock } from "./mocks";
import s from "./LobbyPage.module.css";

const LobbyPage = () => {
  const [matches, setMatches] = useState<LobbyMatch[]>(matchesMock);
  const [isOpenCreateModal, toggleCreateModal] = useModal();
  const [isOpenJoinModal, toggleJoinModal] = useModal();
  const [gameId, setGameId] = useState("");

  const navigate = useNavigate();

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

  const handleCreateTable = async ({
    gameName,
    maxPlayers,
  }: CreateTableFormValues) => {
    const createdGame = await api.games.create({
      gameName,
      maxPlayers,
    });

    const newMatch: LobbyMatch = {
      id: createdGame.gameId,
      title: createdGame.name,
      players: [],
    };

    setMatches((prevMatches) => [newMatch, ...prevMatches]);
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
          <Button className={s.button} onClick={() => toggleCreateModal(true)}>
            Create table
          </Button>

          <Button
            className={clsx(s.button, s.color)}
            onClick={() => toggleJoinModal()}
          >
            Join table
          </Button>
        </div>
      </Section>

      <CreateTableModal
        isOpen={isOpenCreateModal}
        toggleModal={() => toggleCreateModal(false)}
        onSubmit={handleCreateTable}
      />

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
