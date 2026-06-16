import { useEffect, useState } from "react";
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
import { ExistingGameModal } from "./components/ExistingGameModal";
import { JoinGameModal } from "./components/JoinGameModal";
import s from "./LobbyPage.module.css";

type ExistingGame = {
  id: string;
  name: string;
  ownerId: string;
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
  const [matches, setMatches] = useState<LobbyMatch[]>([]);
  const [isOpenCreateModal, toggleCreateModal] = useModal();
  const [isOpenJoinModal, toggleJoinModal] = useModal();
  const [isOpenManageLobbyModal, toggleManageLobbyModal] = useModal();
  const [gameId, setGameId] = useState("");
  const [existingGame, setExistingGame] = useState<ExistingGame | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadGames = async () => {
      try {
        const games = await api.games.getAll();

        if (ignore) return;

        setMatches(
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

    const loadCurrentUser = async () => {
      try {
        const currentUser = await api.me.getMe();

        if (ignore) return;

        setCurrentUserId(currentUser.id);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    void loadCurrentUser();

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
          ownerId: currentGame.ownerId,
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
    navigate("/game", {
      state: { gameId: trimmedGameId },
    });
  };

  const handleReturnToExistingGame = () => {
    if (!existingGame) return;

    navigate("/game", {
      state: { gameId: existingGame.id },
    });
  };

  const handleCloseManageLobbyModal = () => {
    toggleManageLobbyModal(false);
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

      const newMatch: LobbyMatch = {
        gameId: createdGame.id,
        gameName: createdGame.name,
        players: [],
      };

      setMatches((prevMatches) => [newMatch, ...prevMatches]);

      setExistingGame({
        id: createdGame.id,
        name: createdGame.name,
        ownerId: createdGame.ownerId,
      });
    } catch (error) {
      const existingGameId = getExistingGameIdFromError(error);

      if (!existingGameId) {
        throw error;
      }

      const currentGame = await api.games.getCurrent();

      setExistingGame({
        id: existingGameId,
        name: currentGame?.name ?? "your existing game",
        ownerId: currentGame?.ownerId ?? "",
      });

      toggleCreateModal(false);
      toggleManageLobbyModal(true);
    }
  };

  const isCurrentGameOwner =
    existingGame !== null && currentUserId === existingGame.ownerId;

  return (
    <div className={s.pageContainer}>
      <Section className={s.listSection}>
        <List
          items={matches}
          getKey={(match) => match.gameId}
          renderItem={(match) => (
            <button
              type="button"
              className={s.matchButton}
              onClick={() => handleOpenJoinModalWithGameId(match.gameId)}
            >
              <MatchListItem
                match={match}
                isCurrentLobby={existingGame?.id === match.gameId}
                onManageCurrentLobby={() => toggleManageLobbyModal(true)}
              />
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
        isOpen={isOpenManageLobbyModal}
        gameName={existingGame?.name}
        isOwner={isCurrentGameOwner}
        onReturn={handleReturnToExistingGame}
        onClose={handleCloseManageLobbyModal}
      />
    </div>
  );
};

export default LobbyPage;
