// Libraries
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// Project level
import { ClientEvents } from "@exploding-cats/contracts";
import api from "api";
import { PhaserGame } from "components";
import { useGameSession } from "hooks";
import { socket } from "socket";
import { EventBus } from "game/utils";

const LEAVE_GAME_EVENT = "leave-game";

const GamePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [gameId, setGameId] = useState(searchParams.get("gameId") ?? "");
  const [ready, setReady] = useState(false);

  useGameSession(gameId);

  useEffect(() => {
    if (gameId) return;

    const loadCurrentGame = async () => {
      try {
        const currentGame = await api.games.getCurrent();

        if (!currentGame) {
          navigate("/lobby");
          return;
        }

        setGameId(currentGame.id);
      } catch (error) {
        console.error("Failed to load current game:", error);
        navigate("/lobby");
      }
    };

    void loadCurrentGame();
  }, [gameId, navigate]);

  useEffect(() => {
    const main = document.querySelector("main") as HTMLElement;

    if (!main) return;

    const prev = {
      overflow: main.style.overflow,
    };

    main.style.overflow = "hidden";
    // This error is disabled because in this specific case
    // the "unnecessary" rerender is actually "necessary"
    // and gives me the desired effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);

    return () => {
      main.style.overflow = prev.overflow;
    };
  }, []);

  const handleLeaveGame = useCallback(() => {
    if (gameId) {
      socket.emit(ClientEvents.LEAVE_GAME, { gameId });
    }

    navigate("/lobby");
  }, [gameId, navigate]);

  useEffect(() => {
    EventBus.on(LEAVE_GAME_EVENT, handleLeaveGame);

    return () => {
      EventBus.off(LEAVE_GAME_EVENT, handleLeaveGame);
    };
  }, [handleLeaveGame]);

  if (!ready || !gameId) {
    return null;
  }

  return <PhaserGame />;
};

export default GamePage;
