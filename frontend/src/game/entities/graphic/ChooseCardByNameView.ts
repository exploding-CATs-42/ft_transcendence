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

class GraphicCardOption extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, position: Point, cardOption: CardOption) {
    super(scene);
    const icon = this.addIcon(scene, cardOption.iconTextureKey);
  }

  private addIcon(scene: Phaser.Scene, textureKey: string) {
    const { x, y } = ICON_OFFSET;
    const icon = scene.add.image(x, y, textureKey);
    return icon;
  }
}
