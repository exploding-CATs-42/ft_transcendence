import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import api from "api";
import type { GameInfo } from "api/games/games";
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

const mapGameToLobbyGame = (game: GameInfo): LobbyGame => ({
  gameId: game.id,
  gameName: game.name,
  maxPlayers: game.maxPlayers,
  players: game.players,
});

const getGamePath = (gameId: string) => {
  return `/game?gameId=${encodeURIComponent(gameId)}`;
};

const LobbyPage = () => {
  const [games, setGames] = useState<LobbyGame[]>([]);
  const [isOpenCreateModal, toggleCreateModal] = useModal();
  const [isOpenJoinModal, toggleJoinModal] = useModal();
  const [isOpenExistingGameModal, toggleExistingGameModal] = useModal();
  const [gameId, setGameId] = useState("");
  const [existingGame, setExistingGame] = useState<ExistingGame | null>(null);

  const navigate = useNavigate();

  const loadGames = useCallback(async () => {
    try {
      const games = await api.games.getAll();

      setGames(games.map(mapGameToLobbyGame));
    } catch (error) {
      console.error("Failed to load lobby games:", error);
    }
  }, []);

  useEffect(() => {
    // We intentionally load the external games list after the page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadGames();
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

        toggleExistingGameModal(true);
      } catch (error) {
        console.error("Failed to load current game:", error);
      }
    };

    void loadCurrentGame();

    return () => {
      ignore = true;
    };
  }, [toggleExistingGameModal]);

  const handleOpenJoinModalWithGameId = (selectedGameId: string) => {
    setGameId(selectedGameId);
    toggleJoinModal(true);
  };

  const handleJoinGame = async () => {
    const trimmedGameId = gameId.trim();

    if (!trimmedGameId) return;

    try {
      await api.games.joinById(trimmedGameId);

      toggleJoinModal(false);
      navigate(getGamePath(trimmedGameId));
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

  const handleReturnToExistingGame = () => {
    if (!existingGame) return;

    toggleExistingGameModal(false);
    navigate(getGamePath(existingGame.id));
  };

  const handleLeaveExistingGame = async () => {
    if (!existingGame) {
      toggleExistingGameModal(false);
      return;
    }

    try {
      await api.games.leaveById(existingGame.id);

      setExistingGame(null);
      toggleExistingGameModal(false);

      await loadGames();
    } catch (error) {
      console.error("Failed to leave current game:", error);
    }
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

      toggleCreateModal(false);
      navigate(getGamePath(createdGame.id));
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
      toggleExistingGameModal(true);
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
        isOpen={isOpenExistingGameModal}
        gameName={existingGame?.name}
        onReturn={handleReturnToExistingGame}
        onLeave={handleLeaveExistingGame}
      />
    </div>
  );
};

export default LobbyPage;
