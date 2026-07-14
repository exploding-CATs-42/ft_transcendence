import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  ClientEvents,
  type GameRecord,
  type LobbyGameRemovedPayload,
  type LobbyGameUpdatedPayload,
  ServerPrivateEvents,
  ServerPublicEvents,
  type SocketAckPayload,
  SocketErrorCodes,
} from "@exploding-cats/contracts";
import api from "api";
import { Section, Button, List, GameListItem } from "components";
import { useModal, useSocket } from "hooks";
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

const sortGamesByCreatedAt = (games: GameRecord[]) => {
  return [...games].sort((left, right) => right.createdAt - left.createdAt);
};

const upsertLobbyGame = (
  currentGames: GameRecord[],
  updatedGame: GameRecord,
) => {
  const existingGameIndex = currentGames.findIndex(
    (game) => game.id === updatedGame.id,
  );

  if (existingGameIndex === -1) {
    return sortGamesByCreatedAt([updatedGame, ...currentGames]);
  }

  return sortGamesByCreatedAt(
    currentGames.map((game, index) =>
      index === existingGameIndex ? updatedGame : game,
    ),
  );
};

const LobbyPage = () => {
  const [games, setGames] = useState<GameRecord[]>([]);
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

    setGames(sortGamesByCreatedAt(games));
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
    const handleLobbyGameUpdated = ({ game }: LobbyGameUpdatedPayload) => {
      setGames((currentGames) => upsertLobbyGame(currentGames, game));
    };

    const handleLobbyGameRemoved = ({ gameId }: LobbyGameRemovedPayload) => {
      setGames((currentGames) =>
        currentGames.filter((game) => game.id !== gameId),
      );
    };

    socket.on(ServerPublicEvents.LOBBY_GAME_UPDATED, handleLobbyGameUpdated);
    socket.on(ServerPublicEvents.LOBBY_GAME_REMOVED, handleLobbyGameRemoved);

    return () => {
      socket.off(ServerPublicEvents.LOBBY_GAME_UPDATED, handleLobbyGameUpdated);
      socket.off(ServerPublicEvents.LOBBY_GAME_REMOVED, handleLobbyGameRemoved);
    };
  }, [socket]);

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
      const response: SocketAckPayload = await socket
        .timeout(5000)
        .emitWithAck(ClientEvents.JOIN_GAME, { gameId: trimmedGameId });

      if (
        !response.ok &&
        response.code !== SocketErrorCodes.RECONNECT_REQUIRED
      ) {
        setJoinError(response.message);
        return;
      }

      toggleJoinModal(false);
      navigate(`/game?gameId=${encodeURIComponent(trimmedGameId)}`);
    } catch (error) {
      console.error("Failed to join game:", error);
      setJoinError("Connection problem, please try again");
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
          getKey={(game) => game.id}
          renderItem={(game) => (
            <button
              type="button"
              className={s.gameButton}
              onClick={() => handleOpenJoinModalWithGameId(game.id)}
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
