// Libraries
import { Scene, GameObjects } from "phaser";
// Project level
import { SEATS, Textures } from "game/constants";
import type { Player } from "game/entities";

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
) => {
  players.forEach((player, i) => {
    const { x, y } = SEATS[i]!;
    const avatar = scene.add.image(x, y, Textures.avatar).setOrigin(0, 0);

    const radius = Math.min(avatar.displayWidth, avatar.displayHeight) / 2;
    const cx = x + radius;
    const cy = y + radius;

    avatar.setPosition(cx, cy).setOrigin(0.5, 0.5);

    const mask = scene.add.graphics();
    mask.fillCircle(cx, cy, radius);
    avatar.setMask(mask.createGeometryMask());

    scene.add
      .text(cx, cy - radius - 30, player.username, {
        fontSize: 32,
        color: fontColor || "white",
        fontFamily: "Chewy",
      })
      .setOrigin(0.5, 0.5);
  });
};
