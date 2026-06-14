import type { Point, LabelConfig } from "game/@types";
import { Textures } from "game/constants";
import type { Player } from "game/entities";
import { getRoundedAvatarTexture } from "game/utils";

const AVATAR_WIDTH = 193;

export class GraphicPlayer implements Player {
  readonly username: string;
  readonly imageUrl: string | null;
  readonly container: Phaser.GameObjects.Container;
  private avatar: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private confirmedIcon: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    position: Point,
    player: Player,
    labelConfig: LabelConfig,
  ) {
    this.username = player.username;
    this.imageUrl = player.imageUrl;
    this.confirmedIcon = this.addConfirmedIcon(scene);

    const { x, y } = position;
    this.container = scene.add.container(x, y);

    this.avatar = this.addAvatar(scene);
    this.label = this.addUsernameLabel(scene, player.username, labelConfig);

    this.container.add([this.avatar, this.label, this.confirmedIcon]);
  }

  private addAvatar(scene: Phaser.Scene) {
    const textureKey = getRoundedAvatarTexture(scene);
    const avatar = scene.add.image(0, 0, textureKey).setOrigin(0, 0);
    return avatar;
  }

  private addUsernameLabel(
    scene: Phaser.Scene,
    text: string,
    labelConfig: LabelConfig,
  ) {
    const x = AVATAR_WIDTH / 2;
    const y = -8;

    const { fontColor, strokeColor } = labelConfig;
    const label = scene.add
      .text(x, y, text, {
        fontSize: 32,
        fontFamily: "Chewy",
        color: fontColor || "white",
        stroke: strokeColor || "white",
        strokeThickness: 2,
      })
      .setOrigin(0.5, 1);

    return label;
  }

  private addConfirmedIcon(scene: Phaser.Scene) {
    const x = AVATAR_WIDTH - 20;
    const y = AVATAR_WIDTH - 20;

    return scene.add
      .image(x, y, Textures.confirmedIcon)
      .setVisible(false)
      .setDisplaySize(80, 80);
  }

  setConfirmed(confirmed: boolean) {
    this.confirmedIcon.setVisible(confirmed);
  }

  moveTo(x: number, y: number) {
    this.container.setPosition(x, y);
  }
}
