import type { CardBounds } from "game/@types";
import type { Scene } from "phaser";

export const FLYING_CARD_DEPTH = 1000;

interface CardAnimationOptions {
  duration?: number;
  ease?: string;
  depth?: number;
  onComplete?: () => void;
}

export const animateCardTo = (
  scene: Scene,
  card: Phaser.GameObjects.Image,
  to: CardBounds,
  {
    duration,
    ease,
    depth = FLYING_CARD_DEPTH,
    onComplete,
  }: CardAnimationOptions = {},
) => {
  scene.tweens.killTweensOf(card);
  card.setDepth(depth);

  scene.tweens.add({
    targets: card,
    x: to.position.x,
    y: to.position.y,
    displayWidth: to.size.width,
    displayHeight: to.size.height,
    duration,
    ease,

    onComplete: () => onComplete?.(),
  });
};
