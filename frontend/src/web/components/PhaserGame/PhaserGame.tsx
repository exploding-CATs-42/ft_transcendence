// Libraries
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
// Project level
import { EventBus, StartGame } from "game";
// Local level
import type { IRefPhaserGame } from "./types";

interface Props {
  ref: RefObject<IRefPhaserGame | null>;
  currentActiveScene?: (sceneInstance: Phaser.Scene) => void;
}

const PhaserGame = ({ currentActiveScene, ref }: Props) => {
  const gameRef = useRef<Phaser.Game>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // if the <div> element doesn't exist
    // or the game is already created - do nothing
    if (!containerRef.current || gameRef.current) return;

    gameRef.current = StartGame(containerRef.current);

    ref.current = {
      game: gameRef.current,
      scene: null,
    };

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handler = (sceneInstance: Phaser.Scene) => {
      currentActiveScene?.(sceneInstance);
      ref.current = {
        game: gameRef.current,
        scene: sceneInstance,
      };
    };

    EventBus.on("current-scene-ready", handler);

    return () => {
      EventBus.removeListener("current-scene-ready", handler);
    };
  }, [currentActiveScene]);

  return <div ref={containerRef} />;
};

export default PhaserGame;
