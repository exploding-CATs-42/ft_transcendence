// game/utils/sceneHelpers.ts
import { Scene, GameObjects } from "phaser";

export const addBackgroundImage = (
  scene: Scene,
  texture: string,
): GameObjects.Image => {
  const bg = scene.add.image(
    scene.scale.width / 2,
    scene.scale.height / 2,
    texture,
  );

  const scaleX = scene.scale.width / bg.width;
  const scaleY = scene.scale.height / bg.height;

  bg.setOrigin(0.5);
  bg.setScale(Math.max(scaleX, scaleY));

  return bg;
};
