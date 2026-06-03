// Libraries
import { Scene, GameObjects } from "phaser";
// Project level
import { SEATS, Textures } from "game/constants";
import type { Player } from "game/entities";
import { GraphicPlayer } from "game/entities/GraphicPlayer";

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
  const button = scene.add
    .image(
      scene.scale.width - 12,
      scene.scale.height - 12,
      Textures.fullScreenToggle,
    )
    .setOrigin(1, 1)
    .setDisplaySize(70, 70)
    .setInteractive({ useHandCursor: true });

  button.on("pointerdown", () => {
    scene.scale.toggleFullscreen();
  });

  scene.input.keyboard?.on("keydown-F", () => {
    scene.scale.toggleFullscreen();
  });
};

export const addPlayers = (
  scene: Scene,
  players: Player[],
  fontColor: string,
  strokeColor: string,
) => {
  const labelConfig = { fontColor, strokeColor };
  return players.map((player, i) => {
    return new GraphicPlayer(scene, SEATS[i]!, player, labelConfig);
  });
};
