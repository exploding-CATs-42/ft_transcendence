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
    this.createControls(scene);
    this.createLabels(scene);
    this.addConfirmationButton(scene);
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
        if (this.#cards.length > 1) this.reflowCards(scene);
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

  // ==============================
  // Labels & UI updates
  // ==============================

  private addLabel(scene: Phaser.Scene, position: Point, text: string) {
    const { x, y } = position;
    const label = scene.add
      .text(x, y, text, {
        fontFamily: "Chewy",
        fontSize: 44,
        stroke: "black",
        strokeThickness: 1,
      })
      .setOrigin(0.5, 1);
    return label;
  }

  private createLabels(scene: Phaser.Scene): void {
    this.#labelTop = this.createLabel(
      scene,
      { x: 0, y: LABEL_POSITION_Y },
      "Top",
    );

    this.#labelBottom = this.createLabel(
      scene,
      { x: 0, y: LABEL_POSITION_Y },
      "Bottom",
    );

    this.#labelScore = this.createLabel(
      scene,
      { x: 0, y: ARROW_LINE_POSITION_Y - 50 },
      `${this.#explodingKittenPos + 1}/${this.#drawPileSize}`,
    );

    this.add([this.#labelTop, this.#labelBottom, this.#labelScore]);
  }

  private createLabel(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    text: string,
  ): Phaser.GameObjects.Text {
    return this.addLabel(scene, position, text).setAlpha(0);
  }

  private updateLabels(scene: Phaser.Scene): void {
    const { spacing, startX } = this.getLayout();

    const positions = {
      top: startX + CARD_WIDTH / 2,
      bottom: startX + spacing * (this.#cards.length - 1) + CARD_WIDTH / 2,
      score: startX + spacing * (this.#cards.length / 2 - 1) + CARD_WIDTH / 2,
    };

    this.animateLabel(scene, this.#labelTop, positions.top);
    this.animateLabel(scene, this.#labelBottom, positions.bottom);
    this.animateLabel(scene, this.#labelScore, positions.score);
  }

  private animateLabel(
    scene: Phaser.Scene,
    label: Phaser.GameObjects.Text,
    x: number,
  ): void {
    scene.tweens.add({
      targets: label,
      x,
      alpha: 1,
      duration: 250,
      ease: "Back.Out",
    });
  }

  // ==============================
  // Card positioning & animations
  // ==============================

  private reflowCards(scene: Phaser.Scene): void {
    this.updateLabels(scene);
    this.updateCardPositions(scene);
  }

  private updateCardPositions(scene: Phaser.Scene): void {
    const { spacing, startX } = this.getLayout();

    this.#cards.forEach((card, index) => {
      this.sendToBack(card);

      const isSelected = index === this.#explodingKittenPos;

      const target = this.getCardTargetPosition(
        startX,
        spacing,
        index,
        isSelected,
      );

      this.animateCard(scene, card, target);
    });
  }

  private getCardTargetPosition(
    startX: number,
    spacing: number,
    index: number,
    isSelected: boolean,
  ): { x: number; y: number } {
    const baseX = startX + spacing * index;

    if (isSelected) {
      return {
        x: baseX,
        y: DRAW_PILE_POSITION.y - HOVER_CONFIG.lift,
      };
    }

    return {
      x:
        baseX +
        (index < this.#explodingKittenPos
          ? -HOVER_CONFIG.offset
          : HOVER_CONFIG.offset),
      y: DRAW_PILE_POSITION.y,
    };
  }

  private animateCard(
    scene: Phaser.Scene,
    card: Phaser.GameObjects.Image,
    target: { x: number; y: number },
  ): void {
    scene.tweens.add({
      targets: card,
      x: target.x,
      y: target.y,
      duration: 250,
      ease: "Back.Out",
    });
  }

  // ==============================
  // Card movement logic
  // ==============================

  private moveCard(scene: Phaser.Scene, cardPos: number, step: number) {
    const targetPos = cardPos + step;

    if (targetPos < 0 || targetPos >= this.#cards.length) {
      return;
    }

    const currentCard = this.#cards[cardPos];
    const targetCard = this.#cards[targetPos];

    this.#cards[cardPos] = targetCard!;
    this.#cards[targetPos] = currentCard!;

    this.#explodingKittenPos = targetPos;
    this.#cards[targetPos]?.setDepth(this.#cards.length - targetPos);

    this.#labelScore.setText(`${targetPos + 1}/${this.#drawPileSize}`);
    this.reflowCards(scene);
  }

  private startMoving(scene: Phaser.Scene, step: number) {
    this.stopMoving();

    this.#holding = true;
    this.#moveTimer = scene.time.addEvent({
      delay: 150,
      callback: () => {
        if (this.#holding) {
          this.moveCard(scene, this.#explodingKittenPos, step);
        }
      },
      loop: true,
    });
  }

  private stopMoving() {
    this.#holding = false;

    if (this.#moveTimer) {
      this.#moveTimer.remove();
      this.#moveTimer = undefined;
    }
  }

  // ==============================
  // Controls
  // ==============================

  private addArrows(scene: Phaser.Scene) {
    const container = scene.add.container();

    const lineWidth = 1100;
    const arrowOffset = lineWidth / 2 + 100;

    const stopMoving = () => this.stopMoving();

    const createArrow = (x: number, texture: string, direction: number) => {
      const arrow = scene.add
        .image(x, ARROW_LINE_POSITION_Y, texture)
        .setDisplaySize(200, 200)
        .setInteractive({ useHandCursor: true });

      arrow.on("pointerdown", () => {
        this.startMoving(scene, direction);
      });

      arrow.on("pointerup", stopMoving);
      arrow.on("pointerout", stopMoving);
      arrow.on("pointerupoutside", stopMoving);

      return arrow;
    };

    const leftArrow = createArrow(-arrowOffset, Textures.arrowLeft, -1);

    const rightArrow = createArrow(arrowOffset, Textures.arrowRight, 1);

    const positionLine = scene.add
      .rectangle(0, ARROW_LINE_POSITION_Y, lineWidth, 40, 0xffffff)
      .setStrokeStyle(1, 0xffffff);

    container.add([leftArrow, positionLine, rightArrow]);

    return container;
  }

  private addConfirmationButton(scene: Phaser.Scene) {
    const confirmationButton = scene.add
      .image(0, ARROW_LINE_POSITION_Y + 100, Textures.confirmedIcon)
      .setDisplaySize(100, 100)
      .setInteractive({ useHandCursor: true });

    confirmationButton.on("pointerdown", () => {
      if (this.onConfirm) this.onConfirm();
    });

    this.add(confirmationButton);
  }

  private createControls(scene: Phaser.Scene): void {
    this.add(this.addArrows(scene));
  }
}
