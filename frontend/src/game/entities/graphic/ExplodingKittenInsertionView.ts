import { CARD_TYPE_TO_FRAME, SCREEN_HEIGHT, Textures } from "game/constants";
import type { CardConfig, Point, SpacingConfig } from "game/@types";
import {
  addCardVisual,
  getCardFrame,
  getCardSpacing,
  getHandStartX,
} from "game/utils";

const CARD_SCALE = 1.75;

const CARD_BASE_SIZE = {
  width: 186,
  height: 260,
};

const CARD_WIDTH = CARD_BASE_SIZE.width * CARD_SCALE;
const CARD_HEIGHT = CARD_BASE_SIZE.height * CARD_SCALE;

const CARD_BORDER_RADIUS = 20;

const CARD_SPACING_CONFIG: SpacingConfig = {
  minSpacing: 40,
  maxSpacing: 70,
  cardsBeforeMinSpacing: 10,
};

const DRAW_PILE_POSITION: Point = {
  x: 0,
  y: (SCREEN_HEIGHT - CARD_HEIGHT) / 2,
};

const HOVER_CONFIG = {
  lift: 75,
  offset: CARD_WIDTH / 4,
} as const;

const LABEL_POSITION_Y = (SCREEN_HEIGHT - CARD_HEIGHT) / 2 - CARD_HEIGHT / 4;

const ARROW_LINE_POSITION_Y = 900;

export class ExplodingKittenInsertionView extends Phaser.GameObjects.Container {
  onConfirm?: () => void;

  #cards: Phaser.GameObjects.Image[] = [];

  #labelTop!: Phaser.GameObjects.Text;
  #labelBottom!: Phaser.GameObjects.Text;
  #labelScore!: Phaser.GameObjects.Text;

  #explodingKittenPos: number = 0;
  #drawPileSize: number = 0;

  #holding = false;
  #moveTimer?: Phaser.Time.TimerEvent | undefined;

  constructor(scene: Phaser.Scene, drawPileSize: number) {
    super(scene);

    this.#drawPileSize = drawPileSize;
    this.createExplodingKitten(scene);
    this.createDrawPile(scene);
  }

  // ==============================
  // Card creation
  // ==============================

  private createExplodingKitten(scene: Phaser.Scene): void {
    const frameIndex = CARD_TYPE_TO_FRAME["EXPLODING_KITTEN"];
    const frame = getCardFrame(scene, frameIndex);

    const explodingKitten = this.addCard(frame, scene, 0);

    this.add(explodingKitten);
    this.bringToTop(explodingKitten);
  }

  private createDrawPile(scene: Phaser.Scene): void {
    for (let i = 1; i <= this.#drawPileSize; i++) {
      const cardCover = scene.textures.get(Textures.cardCover).get();
      const card = this.addCard(cardCover, scene, i);

      this.add(card);
      this.sendToBack(card);
    }
  }

  addCard(
    frame: Phaser.Textures.Frame,
    scene: Phaser.Scene,
    insertIndex: number,
  ) {
    const x = this.getInsertPositionX(insertIndex);
    const y = DRAW_PILE_POSITION.y;

    const image = this.addInteractiveCard(x, y, frame, scene);

    scene.tweens.add({
      targets: image,
      x: x,
      y: DRAW_PILE_POSITION.y,
      duration: 500,
      ease: "Back.easeOut",

      onComplete: () => {
        this.#cards.splice(insertIndex, 0, image);
      },
    });
    return image;
  }

  private addInteractiveCard(
    x: number,
    y: number,
    frame: Phaser.Textures.Frame,
    scene: Phaser.Scene,
  ): Phaser.GameObjects.Image {
    const cardConfig = this.buildCardConfig(frame);
    const image = addCardVisual(
      scene,
      { x, y },
      cardConfig,
      CARD_BORDER_RADIUS,
    ).setInteractive();

    return image;
  }

  private buildCardConfig(frame: Phaser.Textures.Frame): CardConfig {
    return {
      frame: frame,
      size: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      },
    };
  }

  // ==============================
  // Layout calculation
  // ==============================

  private getInsertPositionX(insertIndex: number) {
    const { spacing, startX } = this.getLayout();

    let targetX;

    if (this.#cards.length === 0)
      targetX = DRAW_PILE_POSITION.x - CARD_WIDTH / 2;
    else targetX = startX + spacing * insertIndex - spacing / 2;

    return targetX;
  }

  getLayout() {
    const cardCount = this.#cards.length;
    const spacing = getCardSpacing(cardCount, CARD_SPACING_CONFIG);
    const baseX = DRAW_PILE_POSITION.x;
    const startX = getHandStartX(cardCount, spacing, CARD_WIDTH, baseX);

    return { spacing, startX };
  }
}
