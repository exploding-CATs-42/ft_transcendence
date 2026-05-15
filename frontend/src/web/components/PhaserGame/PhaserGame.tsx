// Libraries
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
// Project level
import { EventBus, StartGame } from "game";
// Local level
import type { IRefPhaserGame } from "./types";

interface IProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
  ({ currentActiveScene }, ref) => {
    const gameRef = useRef<Phaser.Game | null>(null!);

    useLayoutEffect(() => {
      if (gameRef.current === null) {
        gameRef.current = StartGame("game-container");

        if (typeof ref === "function") {
          ref({ game: gameRef.current, scene: null });
        } else if (ref) {
          ref.current = { game: gameRef.current, scene: null };
        }
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          if (gameRef.current !== null) {
            gameRef.current = null;
          }
        }
      };
    }, [ref]);

    useEffect(() => {
      EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        if (currentActiveScene && typeof currentActiveScene === "function") {
          currentActiveScene(scene_instance);
        }

        if (typeof ref === "function") {
          ref({ game: gameRef.current, scene: scene_instance });
        } else if (ref) {
          ref.current = { game: gameRef.current, scene: scene_instance };
        }
      });
      return () => {
        EventBus.removeListener("current-scene-ready");
      };
    }, [currentActiveScene, ref]);

    return <div id="game-container"></div>;
  },
);

export default PhaserGame;
