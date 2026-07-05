const BACKGROUND_CONFIG = {
  width: 900,
  height: 300,
  color: 0x94c124,
  borderRadius: 20,
};

const TEXT_CONFIG = {
  color: "white",
  fontFamily: "Chewy",
  fontSize: 54,
};

export class DefuseView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, playerName: string) {
    super(scene);
    const background = this.addBackground(scene);
    const playerNameLabel = this.addPlayerNameLabel(scene, playerName);
    const actionLabel = this.addActionLabel(scene);
    this.add([background, playerNameLabel, actionLabel]);
  }

  private addBackground(scene: Phaser.Scene) {
    const { width, height, color, borderRadius } = BACKGROUND_CONFIG;

    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(
      -width / 4,
      -height / 2,
      width,
      height,
      borderRadius,
    );

    return graphics;
  }

  private addPlayerNameLabel(scene: Phaser.Scene, name: string) {
    const label = scene.add.text(130, -100, name, { ...TEXT_CONFIG });
    return label;
  }

  private addActionLabel(scene: Phaser.Scene) {
    const text = "HAS DEFUSED THE EXPLODING KITTEN!";
    const label = scene.add.text(-160, 0, text, { ...TEXT_CONFIG });
    return label;
  }
}
