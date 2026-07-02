import type { CardOption, Point } from "game/@types";

export class ChooseCardByNameView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }
}

// ------------------- CONFIGURATION -------------------
const ICON_OFFSET: Point = {
  x: 50,
  y: 0,
};

const LABEL_OFFSET: Point = {
  x: 0,
  y: 60,
};

class GraphicCardOption extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, position: Point, cardOption: CardOption) {
    super(scene);
    const icon = this.addIcon(scene, cardOption.iconTextureKey);
    const label = this.addLabel(scene, cardOption.label);
  }

  private addIcon(scene: Phaser.Scene, textureKey: string) {
    const { x, y } = ICON_OFFSET;
    const icon = scene.add.image(x, y, textureKey);
    return icon;
  }

  private addLabel(scene: Phaser.Scene, text: string) {
    const { x, y } = LABEL_OFFSET;
    const label = scene.add.text(x, y, text).setOrigin(0, 0);
    return label;
  }
}
