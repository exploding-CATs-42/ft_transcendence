import type { CardOption, Point } from "game/@types";

export class ChooseCardByNameView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene);
  }
}

class GraphicCardOption extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, position: Point, cardOption: CardOption) {
    super(scene);
  }
}
