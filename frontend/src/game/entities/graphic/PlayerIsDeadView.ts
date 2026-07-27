import { FireFrameAnimation } from "game/animations/FireFrameAnimation";

const BACKGROUND_CONFIG = {
  width: 780,
  height: 300,
  color: 0x5b1015,
  borderRadius: 50,
};

const NAME_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  color: "#ffffff",
  fontFamily: "Chewy",
  fontSize: "48px",
};

const DEAD_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  color: "#ffd166",
  fontFamily: "Chewy",
  fontSize: "72px",
};

export class PlayerIsDeadView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, playerName: string) {
    super(scene);
    const background = this.addBackground(scene);
    const playerNameLabel = this.addPlayerNameLabel(scene, playerName);
    const actionLabel = this.addActionLabel(scene);

    const fire = new FireFrameAnimation(scene, { x: 0, y: 0 });
    fire.setDisplaySize(780, 300);

    fire.playAnimation();
    this.add([background, playerNameLabel, actionLabel, fire]);
  }

  private addBackground(scene: Phaser.Scene) {
    const { width, height, color, borderRadius } = BACKGROUND_CONFIG;

    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      borderRadius,
    );

    return graphics;
  }

  private addPlayerNameLabel(scene: Phaser.Scene, name: string) {
    return scene.add.text(0, -55, name, NAME_STYLE).setOrigin(0.5);
  }

  private addActionLabel(scene: Phaser.Scene) {
    return scene.add.text(0, 25, "EXPLODED!", DEAD_STYLE).setOrigin(0.5);
  }
}
