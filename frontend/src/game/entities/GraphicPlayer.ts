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
    if (this.imageUrl) this.loadRemoteAvatar(scene, avatar, this.imageUrl);
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

  private loadRemoteAvatar(
    scene: Phaser.Scene,
    avatar: Phaser.GameObjects.Image,
    url: string,
  ) {
    const key = `avatar_${url}`;

    const setAvatarVisible = () => {
      avatar.setTexture(getRoundedAvatarTexture(scene, key));
      avatar.setDisplaySize(AVATAR_WIDTH, AVATAR_WIDTH);
      this.container.setVisible(true);
    };

    // If avatar loaded and cached just display it.
    if (scene.textures.exists(key)) {
      return setAvatarVisible();
    }

    // Hide the whole seat until the real avatar is ready to avoid flickering.
    this.container.setVisible(false);

    // If the download fails, still show the player with the default avatar.
    const onError = (file: Phaser.Loader.File) => {
      if (file.key !== key) return;
      scene.load.off("loaderror", onError);
      this.container.setVisible(true);
    };

    scene.load.crossOrigin = "anonymous";
    scene.load.image(key, url);
    scene.load.once(`filecomplete-image-${key}`, () => {
      scene.load.off("loaderror", onError);
      setAvatarVisible();
    });
    scene.load.on("loaderror", onError);
    scene.load.start();
  }

  setConfirmed(confirmed: boolean) {
    this.confirmedIcon.setVisible(confirmed);
  }

  moveTo(x: number, y: number) {
    this.container.setPosition(x, y);
  }
}
