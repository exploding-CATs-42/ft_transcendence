import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ClientEvents, ServerPrivateEvents } from "@exploding-cats/contracts";
import api from "api";
import { Section, Button, List, GameListItem } from "components";
import { useModal, useSocket } from "hooks";
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

type ApiError = {
  response?: {
    status?: number;
  };
};

const getExistingGameIdFromError = (error: unknown) => {
  const apiError = error as ApiConflictError;

  if (apiError.response?.status !== 409) {
    return null;
  }

  return apiError.response.data?.details?.existingGameId ?? null;
};

const isTableNotFoundError = (error: unknown) => {
  const apiError = error as ApiError;

  return apiError.response?.status === 404;
};

const toLobbyGame = (game: { id: string; name: string }): LobbyGame => ({
  gameId: game.id,
  gameName: game.name,
  players: [],
});

const LobbyPage = () => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isOpenCreateModal, toggleCreateModal] = useModal();
  const [isOpenJoinModal, toggleJoinModal] = useModal();
  const [gameId, setGameId] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [existingGame, setExistingGame] = useState<ExistingGame | null>(null);

  const navigate = useNavigate();
  const { socket } = useSocket();

  const loadGames = useCallback(async () => {
    const games = await api.games.getAll();

    setGames(games.map(toLobbyGame));
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadLobbyGames = async () => {
      try {
        if (ignore) return;

        await loadGames();
      } catch (error) {
        console.error("Failed to load lobby games:", error);
      }
    };

    void loadLobbyGames();

    return () => {
      ignore = true;
    };
  }, [loadGames]);

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
    setJoinError("");
    toggleJoinModal(true);
  };

  const handleOpenCreateModal = () => {
    setJoinError("");
    toggleJoinModal(false);
    toggleCreateModal(true);
  };

  const handleOpenJoinModal = () => {
    setJoinError("");
    toggleCreateModal(false);
    toggleJoinModal(true);
  };

  const handleCloseJoinModal = () => {
    setJoinError("");
    setIsJoiningGame(false);
    toggleJoinModal(false);
  };

  const handleGameIdChange = (value: string) => {
    setGameId(value);
    setJoinError("");
  };

  const handleJoinGame = async () => {
    const trimmedGameId = gameId.trim();

    setJoinError("");

    if (!trimmedGameId) {
      setJoinError("Please enter a table id");
      return;
    }

    setIsJoiningGame(true);

    try {
      await api.games.getById(trimmedGameId);

      toggleJoinModal(false);
      navigate(`/game?gameId=${encodeURIComponent(trimmedGameId)}`);
    } catch (error) {
      if (isTableNotFoundError(error)) {
        setJoinError("Table not found");
        return;
      }

      console.error("Failed to validate table id:", error);
      setJoinError("Could not validate table id. Please try again.");
    } finally {
      setIsJoiningGame(false);
    }
  };

  const handleReturnToExistingGame = () => {
    if (!existingGame) return;

    navigate(`/game?gameId=${encodeURIComponent(existingGame.id)}`);
  };

  const handleCloseExistingGameModal = () => {
    setExistingGame(null);
  };

  const handleLeaveExistingGame = () => {
    if (!existingGame) return;

    socket.once(ServerPrivateEvents.LEFT_GAME, () => {
      setExistingGame(null);
      void loadGames();
    });
    socket.emit(ClientEvents.LEAVE_GAME, { gameId: existingGame.id });
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
          <Button className={s.button} onClick={handleOpenCreateModal}>
            Create table
          </Button>

          <Button
            className={clsx(s.button, s.color)}
            onClick={handleOpenJoinModal}
          >
            Join table
          </Button>
        </div>
      </Section>

      <CreateTableModal
        isOpen={isOpenCreateModal}
        toggleModal={() => toggleCreateModal(false)}
        onSubmit={handleCreateTable}
        onJoinClick={handleOpenJoinModal}
      />

      <JoinGameModal
        isOpen={isOpenJoinModal}
        gameId={gameId}
        joinError={joinError}
        isJoining={isJoiningGame}
        toggleModal={handleCloseJoinModal}
        onGameIdChange={handleGameIdChange}
        onJoin={handleJoinGame}
        onCreateClick={handleOpenCreateModal}
      />

      <ExistingGameModal
        isOpen={Boolean(existingGame)}
        gameName={existingGame?.name}
        onReturn={handleReturnToExistingGame}
        onLeave={handleLeaveExistingGame}
        onClose={handleCloseExistingGameModal}
      />
    </div>
  );
};

export default LobbyPage;
