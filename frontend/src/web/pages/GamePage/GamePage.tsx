// Libraries
import { useRef, useState } from "react";
// Project level
import { PhaserGame } from "components";
import type { PhaserGameRef } from "types";
import { MainMenu } from "game/scenes";
// Local level
import s from "./GamePage.module.css";

const GamePage = () => {
  // The sprite can only be moved in the MainMenu Scene
  const [canMoveSprite, setCanMoveSprite] = useState(true);
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<PhaserGameRef>(null);

  const getScene = () => phaserRef.current?.scene ?? null;

  const changeScene = () => {
    (getScene() as MainMenu)?.changeScene();
  };

  const moveSprite = () => {
    const scene = getScene() as MainMenu;

    if (!scene) return;
    if (scene.scene.key !== "MainMenu") return;

    // Get the update logo position
    scene.moveLogo(({ x, y }) => {
      setSpritePosition({ x, y });
    });
  };

  const addSprite = () => {
    const scene = getScene();

    if (!scene) return;

    // Add more stars
    const x = Phaser.Math.Between(64, scene.scale.width - 64);
    const y = Phaser.Math.Between(64, scene.scale.height - 64);

    //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
    const star = scene.add.sprite(x, y, "star");

    //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
    //  You could, of course, do this from within the Phaser Scene code, but this is just an example
    //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
    scene.add.tween({
      targets: star,
      duration: 500 + Math.random() * 1000,
      alpha: 0,
      yoyo: true,
      repeat: -1,
    });
  };

  // Event emitted from the PhaserGame component
  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  return (
    <div id="app" className={s.app}>
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      <div>
        <div>
          <button className={s.button} onClick={changeScene}>
            Change Scene
          </button>
        </div>
        <div>
          <button
            disabled={canMoveSprite}
            className={s.button}
            onClick={moveSprite}
          >
            Toggle Movement
          </button>
        </div>
        <div className={s.spritePosition}>
          Sprite Position:
          <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
        </div>
        <div>
          <button className={s.button} onClick={addSprite}>
            Add New Sprite
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
