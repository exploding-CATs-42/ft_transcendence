import type { Point, LabelConfig } from "game/@types";
import { Textures } from "game/constants";
import type { Player } from "game/entities";

const AVATAR_WIDTH = 193;

export class GraphicPlayer implements Player {
  readonly username: string;
  readonly imageUrl: string | null;
  private scene: Phaser.Scene;
  readonly container: Phaser.GameObjects.Container;
  private avatar: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private position: Point;
  private avatarMask: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    position: Point,
    player: Player,
    labelConfig: LabelConfig,
  ) {
    this.username = player.username;
    this.imageUrl = player.imageUrl;

    this.scene = scene;

    this.position = position;
    const { x, y } = position;
    this.container = scene.add.container(x, y);

    this.avatar = this.addAvatar(scene);
    this.avatarMask = this.addAvatarMask();
    this.avatar.setMask(this.avatarMask.createGeometryMask());
    this.drawMask();
    this.label = this.addUsernameLabel(scene, player.username, labelConfig);

    this.container.add([this.avatar, this.label]);
  }

  private addAvatar(scene: Phaser.Scene) {
    const avatar = scene.add.image(0, 0, Textures.avatar).setOrigin(0, 0);
    return avatar;
  }

  private addAvatarMask() {
    const mask = this.scene.add.graphics();
    mask.setVisible(false);
    return mask;
  }

  private drawMask() {
    const radius = AVATAR_WIDTH / 2;

    // Unfortunately Phaser geometry masks always use scene/world coordinates,
    // not container-local coordinates.
    // So when container moves, I need to move the mask with it,
    // otherwise it stays behind and I don't see the avatar
    const x = this.position.x + radius; // world coords
    const y = this.position.y + radius; // world coords

    this.avatarMask.clear();
    this.avatarMask.fillCircle(x, y, radius);
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
    this.position = { x, y };
    this.container.setPosition(x, y);
    this.drawMask();
  }
}
