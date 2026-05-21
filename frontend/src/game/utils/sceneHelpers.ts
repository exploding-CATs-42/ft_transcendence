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

export const addFullscreenToggle = (scene: Scene) => {
  const button = scene.add.dom(
    0,
    0,
    "button",
    "position: absolute; bottom: 12px; right: 12px; font-size: 32px; color: black;",
    "CLICK ME",
  );

  button.addListener("click");
  button.on("click", () => {
    scene.scale.toggleFullscreen();
  });

  scene.input.keyboard?.on("keydown-F", () => {
    scene.scale.toggleFullscreen();
  });
};
