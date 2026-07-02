import type { CardOption, Point } from "game/@types";
import { CARD_OPTIONS } from "game/constants";

// ------------------- CONFIGURATION -------------------
const CARD_OPTIONS_PER_ROW = 4;
const COLUMN_GAP = 300;
const ROW_GAP = 200;

const ICONS_CONTAINER_OFFSET = {
  x: 100,
  y: 104,
};

// ---------------------- CLASS ----------------------
export class ChooseCardByNameView extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene) {
    super(scene);
    const background = this.addBackground(scene);
    const images = this.addCardOptions(scene);
  }

  private addBackground(scene: Phaser.Scene) {
    const width = 1200;
    const height = 670;

    // black background
    const background = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
    );

    return background;
  }

  private addCardOptions(scene: Phaser.Scene) {
    const iconsContainer = scene.add.container();
    this.fillContainerWithIcons(scene, iconsContainer);

    // Put it in the middle of the black background
    const { x, y } = ICONS_CONTAINER_OFFSET;
    iconsContainer.setPosition(x, y);

    return iconsContainer;
  }

  private fillContainerWithIcons(
    scene: Phaser.Scene,
    container: Phaser.GameObjects.Container,
  ) {
    const iconsAmount = CARD_OPTIONS.length;
    const rowsCount = iconsAmount / CARD_OPTIONS_PER_ROW;
    const columnsCount = CARD_OPTIONS_PER_ROW;
    let i = 0;
    const pos: Point = { x: 0, y: 0 };
    for (let y = 0; y < rowsCount; ++y) {
      for (let x = 0; x < columnsCount && i < iconsAmount; ++x) {
        const icon = new GraphicCardOption(scene, pos, CARD_OPTIONS[i]!);
        container.add(icon);
        pos.x += COLUMN_GAP;
        ++i;
      }
      pos.x = 0;
      pos.y += ROW_GAP;
    }
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
    this.add([icon, label]);
    this.setPosition(position.x, position.y);
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
