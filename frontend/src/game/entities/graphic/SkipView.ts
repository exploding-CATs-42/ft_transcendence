const BACKGROUND_CONFIG = {
  width: 780,
  height: 300,
  color: 0x2ea3dc,
  borderRadius: 20,
};

const TEXT_CONFIG = {
  color: "white",
  fontFamily: "Chewy",
  fontSize: 54,
};

export class SkipView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, _playerName: string) {
    super(scene);
    const background = this.addBackground(scene);
    const actionLabel = this.addActionLabel(scene);
    this.add([background, actionLabel]);
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

  private addActionLabel(scene: Phaser.Scene) {
    const text = "SKIPPED A TURN";
    const label = scene.add.text(-160, 0, text, { ...TEXT_CONFIG });
    return label;
  }
}
