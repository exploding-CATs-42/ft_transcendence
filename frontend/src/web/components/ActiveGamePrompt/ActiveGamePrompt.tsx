import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientEvents, ServerPrivateEvents } from "@exploding-cats/contracts";
import api from "api";
import { useAuth, useSocket } from "hooks";
import { ExistingGameModal } from "pages/LobbyPage/components/ExistingGameModal";

type ExistingGame = {
  id: string;
  name: string;
};

const HIDDEN_PATHS = new Set(["/game", "/lobby"]);

const shouldShowPromptOnPath = (pathname: string) => {
  return !HIDDEN_PATHS.has(pathname);
};

const ActiveGamePrompt = () => {
  const [existingGame, setExistingGame] = useState<ExistingGame | null>(null);
  const { authStatus } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentGame = useCallback(async (): Promise<ExistingGame | null> => {
    if (authStatus !== "authenticated") {
      return null;
    }

    if (!shouldShowPromptOnPath(location.pathname)) {
      return null;
    }

    const currentGame = await api.games.getCurrent();

    return currentGame ? { id: currentGame.id, name: currentGame.name } : null;
  }, [authStatus, location.pathname]);

  useEffect(() => {
    let ignore = false;

    const syncCurrentGame = async () => {
      try {
        const currentGame = await getCurrentGame();

        if (!ignore) {
          setExistingGame(currentGame);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load current game:", error);
        }
      }
    };

    if (!ignore) {
      void syncCurrentGame();
    }

    return () => {
      ignore = true;
    };
  }, [getCurrentGame]);

  const handleReturnToExistingGame = () => {
    if (!existingGame) return;

    navigate(`/game?gameId=${encodeURIComponent(existingGame.id)}`);
  };

  const handleLeaveExistingGame = () => {
    if (!existingGame) return;

    socket.once(ServerPrivateEvents.LEFT_GAME, () => {
      setExistingGame(null);
    });
    socket.emit(ClientEvents.LEAVE_GAME, { gameId: existingGame.id });
  };

  const handleCloseExistingGameModal = () => {
    setExistingGame(null);
  };

  return (
    <ExistingGameModal
      isOpen={Boolean(existingGame)}
      gameName={existingGame?.name}
      onReturn={handleReturnToExistingGame}
      onLeave={handleLeaveExistingGame}
      onClose={handleCloseExistingGameModal}
    />
  );
};

export default ActiveGamePrompt;
