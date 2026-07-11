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
  }
}
