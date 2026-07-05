const BACKGROUND_CONFIG = {
  width: 780,
  height: 300,
  color: 0x2ea3dc,
  borderRadius: 20,
};
export class SkipView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, _playerName: string) {
    super(scene);
    const background = this.addBackground(scene);
    this.add([background]);
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
}
