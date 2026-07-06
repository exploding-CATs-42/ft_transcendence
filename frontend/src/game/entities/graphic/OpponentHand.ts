import type { CardConfig, Point, SpacingConfig } from "game/@types";
import { Textures } from "game/constants";
import { addCardVisual, getCardSpacing, getHandStartX } from "game/utils";

const CARD_WIDTH = 46;
const CARD_HEIGHT = 65;
const CARD_BORDER_RADIUS = 5;

const MIN_CARD_SPACING = CARD_WIDTH / 3;
const MAX_CARD_SPACING = CARD_WIDTH / 2;
const MAX_CARDS = 5;

const BADGE_RADIUS = 17;
const BADGE_OFFSET_X = 4; // gap between rightmost card's right edge and badge center
const BADGE_OFFSET_Y = -4; // slightly above the card top edge
const BADGE_SHADOW_OFFSET_X = -1;
const BADGE_SHADOW_OFFSET_Y = 3;

export class OpponentHand {
  #scene: Phaser.Scene;
  // Config
  #cardConfig: CardConfig;
  #spacingConfig: SpacingConfig;
  // Container
  readonly container: Phaser.GameObjects.Container; // root container
  // Cards
  #cardsContainer: Phaser.GameObjects.Container; // for positioning and display order
  #cards: Phaser.GameObjects.Container[] = []; // for easy card refs access
  // Badge
  #badge: Phaser.GameObjects.Container; // container for circle, shadow and amount label
  #amountLabel: Phaser.GameObjects.Text;
  #cardCount: number = 0; // how many cards opponent has

  constructor(scene: Phaser.Scene, position: Point) {
    this.#scene = scene;

    this.#cardConfig = this.buildCardConfig();
    this.#spacingConfig = this.buildSpacingConfig();

    this.container = scene.add.container(position.x, position.y);

    this.#cardsContainer = scene.add.container(0, 0);
    this.container.add(this.#cardsContainer);

    const { badge, label } = this.buildBadge();
    this.#badge = badge;
    this.#amountLabel = label;
    this.container.add(this.#badge);
  }

  // --------------- Public API ---------------

  setCardCount(cardCount: number) {
    const nextCardCount = Math.max(0, cardCount);

    while (this.#cardCount < nextCardCount) this.addCard();
    while (this.#cardCount > nextCardCount) this.removeCard();
  }

  addCard() {
    this.#cardCount++;
    this.#amountLabel.setText(this.#cardCount.toString());
    this.#badge.setVisible(true);

    if (this.#cardCount <= MAX_CARDS) {
      const spawnX = this.getSpawnX();
      const card = this.buildCard(spawnX);
      this.#cards.push(card);
      this.#cardsContainer.add(card);
      this.reflowCards();
    }
  }

  removeCard() {
    if (this.#cardCount === 0) return;
    this.#cardCount--;
    this.#amountLabel.setText(this.#cardCount.toString());
    this.#badge.setVisible(this.#cardCount > 0);

    if (this.#cardCount < MAX_CARDS) {
      const card = this.#cards.pop()!;
      card.destroy();
      this.reflowCards();
    }
  }

  // --------------- Layout ---------------

  private getSpawnX(): number {
    if (this.#cards.length === 0) return 0;
    const last = this.#cards[this.#cards.length - 1]!;
    return last.x + MAX_CARD_SPACING;
  }

  private reflowCards() {
    const count = this.#cards.length;
    if (count === 0) return;

    const spacing = getCardSpacing(count, this.#spacingConfig);
    let x = getHandStartX(count, spacing, CARD_WIDTH, 0);

    this.#cards.forEach((card, i) => {
      card.setDepth(i);

      this.#scene.tweens.add({
        targets: card,
        x: x,
        y: 0,
        duration: 250,
        ease: "Back.Out",
      });

      x += spacing;
    });

    const lasCardX = x - spacing;
    this.updateBadgePosition(lasCardX);
  }

  private updateBadgePosition(lastCardX: number) {
    const badgeX = lastCardX + CARD_WIDTH + BADGE_OFFSET_X;
    const badgeY = BADGE_OFFSET_Y;
    this.#badge.setPosition(badgeX, badgeY);
  }

  // --------------- Builders ---------------

  private buildCard(spawnX: number) {
    const cardContainer = this.#scene.add.container(spawnX, 0);

    // Card
    const card = addCardVisual(
      this.#scene,
      { x: 0, y: 0 },
      this.#cardConfig,
      CARD_BORDER_RADIUS,
    );

    // Border
    const border = this.#scene.add.graphics();
    border.lineStyle(1, 0x000000);
    border.strokeRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_BORDER_RADIUS);

    // Combine
    cardContainer.add([card, border]);
    return cardContainer;
  }

  private buildBadge() {
    const badge = this.#scene.add.container(0, 0);

    // Shadow
    const shadow = this.#scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillCircle(
      BADGE_SHADOW_OFFSET_X,
      BADGE_SHADOW_OFFSET_Y,
      BADGE_RADIUS + 1,
    );

    // Circle
    const circle = this.#scene.add.graphics();
    circle.fillStyle(0xfac700, 1);
    circle.fillCircle(0, 0, BADGE_RADIUS);

    // Amount label
    const label = this.#scene.add
      .text(0, 0, "0", {
        color: "#000000",
        fontFamily: "Chewy",
        fontSize: "20px",
      })
      .setOrigin(0.5);

    // Combine
    badge.add([shadow, circle, label]);
    badge.setVisible(false);
    return { badge, label };
  }

  private buildCardConfig(): CardConfig {
    const cardCover = this.#scene.textures.get(Textures.cardCover).get();
    return {
      frame: cardCover,
      size: { width: CARD_WIDTH, height: CARD_HEIGHT },
    };
  }

  private buildSpacingConfig(): SpacingConfig {
    return {
      minSpacing: MIN_CARD_SPACING,
      maxSpacing: MAX_CARD_SPACING,
      cardsBeforeMinSpacing: MAX_CARDS,
    };
  }
}
