import type { Point, LabelConfig } from "game/@types";
import type { Player } from "game/entities";
import { getRoundedAvatarTexture } from "game/utils";

const AVATAR_WIDTH = 193;

export class GraphicPlayer implements Player {
  readonly username: string;
  readonly imageUrl: string | null;
  readonly container: Phaser.GameObjects.Container;
  private avatar: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    position: Point,
    player: Player,
    labelConfig: LabelConfig,
  ) {
    this.username = player.username;
    this.imageUrl = player.imageUrl;

    const { x, y } = position;
    this.container = scene.add.container(x, y);

    this.avatar = this.addAvatar(scene);
    this.label = this.addUsernameLabel(scene, player.username, labelConfig);

    this.container.add([this.avatar, this.label]);
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

  moveTo(x: number, y: number) {
    this.container.setPosition(x, y);
  }
}
