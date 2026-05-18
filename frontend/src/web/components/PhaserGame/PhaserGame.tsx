// Libraries
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
// Project level
import { EventBus, StartGame } from "game";
// Local level
import type { PhaserGameRef } from "./types";

interface Props {
  ref?: RefObject<PhaserGameRef | null>;
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

    if (ref) {
      ref.current = {
        game: gameRef.current,
        scene: null,
      };
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [ref]);

  useEffect(() => {
    const handler = (sceneInstance: Phaser.Scene) => {
      currentActiveScene?.(sceneInstance);

      if (ref) {
        ref.current = {
          game: gameRef.current,
          scene: sceneInstance,
        };
      }
    };

    EventBus.on("current-scene-ready", handler);

    return () => {
      EventBus.removeListener("current-scene-ready", handler);
    };
  }, [currentActiveScene, ref]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default PhaserGame;
