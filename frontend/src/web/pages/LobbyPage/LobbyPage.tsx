import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import api from "api";
import { Section, Button, List, GameListItem } from "components";
import { useModal } from "hooks";
import type { LobbyGame } from "types";
import {
  CreateTableModal,
  type CreateTableFormValues,
} from "./components/CreateTableModal";
import { ExistingGameModal } from "./components/ExistingGameModal";
import { JoinGameModal } from "./components/JoinGameModal";
import s from "./LobbyPage.module.css";

type ExistingGame = {
  id: string;
  name: string;
};

type GameConflictDetails = {
  existingGameId?: string;
};

type ApiConflictError = {
  response?: {
    status?: number;
    data?: {
      details?: GameConflictDetails;
    };
  };
};

const getExistingGameIdFromError = (error: unknown) => {
  const apiError = error as ApiConflictError;

  if (apiError.response?.status !== 409) {
    return null;
  }

  return apiError.response.data?.details?.existingGameId ?? null;
};

const LobbyPage = () => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isOpenCreateModal, toggleCreateModal] = useModal();
  const [isOpenJoinModal, toggleJoinModal] = useModal();
  const [gameId, setGameId] = useState("");
  const [existingGame, setExistingGame] = useState<ExistingGame | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadGames = async () => {
      try {
        const games = await api.games.getAll();

        if (ignore) return;

        setGames(
          games.map((game) => ({
            gameId: game.id,
            gameName: game.name,
            players: [],
          })),
        );
      } catch (error) {
        console.error("Failed to load lobby games:", error);
      }
    };

    void loadGames();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadCurrentGame = async () => {
      try {
        const currentGame = await api.games.getCurrent();

        if (ignore || !currentGame) return;

        setExistingGame({
          id: currentGame.id,
          name: currentGame.name,
        });
      } catch (error) {
        console.error("Failed to load current game:", error);
      }
    };

    void loadCurrentGame();

    return () => {
      ignore = true;
    };
  }, []);

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

  const handleReturnToExistingGame = () => {
    if (!existingGame) return;

    navigate(`/game?gameId=${encodeURIComponent(existingGame.id)}`);
  };

  const handleCloseExistingGameModal = () => {
    setExistingGame(null);
  };

  const handleCreateTable = async ({
    gameName,
    maxPlayers,
  }: CreateTableFormValues) => {
    try {
      const createdGame = await api.games.create({
        gameName,
        maxPlayers,
      });

      const newGame: LobbyGame = {
        gameId: createdGame.id,
        gameName: createdGame.name,
        players: [],
      };

      setGames((prevGames) => [newGame, ...prevGames]);
      navigate(`/game?gameId=${encodeURIComponent(createdGame.id)}`);
    } catch (error) {
      const existingGameId = getExistingGameIdFromError(error);

      if (!existingGameId) {
        throw error;
      }

      const currentGame = await api.games.getCurrent();

      setExistingGame({
        id: existingGameId,
        name: currentGame?.name ?? "your existing game",
      });

      toggleCreateModal(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      <Section className={s.listSection}>
        <List
          items={games}
          getKey={(game) => game.gameId}
          renderItem={(game) => (
            <button
              type="button"
              className={s.gameButton}
              onClick={() => handleOpenJoinModalWithGameId(game.gameId)}
            >
              <GameListItem game={game} />
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

      <ExistingGameModal
        isOpen={Boolean(existingGame)}
        gameName={existingGame?.name}
        onReturn={handleReturnToExistingGame}
        onClose={handleCloseExistingGameModal}
      />
    </div>
  );
};

export default LobbyPage;
