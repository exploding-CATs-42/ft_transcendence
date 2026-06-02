import type { CardConfig, Point, SpacingConfig } from "game/@types";
import { createRoundedCardTexture } from "game/utils";

export const getCardSpacing = (
  cardCount: number,
  spacingConfig: SpacingConfig,
): number => {
  const {
    minSpacing,
    maxSpacing,
    cardsBeforeMinSpacing: maxCount,
  } = spacingConfig;

  if (cardCount <= 1) return maxSpacing;
  if (cardCount >= maxCount) return minSpacing;

  // Calculate how full the hand is.
  // If we have 1 card - it's empty
  // If we have 20+ cards it's full
  // The progress is a value from 0 to 1 (0% -> 100%)
  const progress = (cardCount - 1) / (maxCount - 1);
  const SPACE_TO_SHRINK = maxSpacing - minSpacing;

  // Decrease the spacing on some amount
  // from the amount of on how much spacing can shrink
  // depending on how full the hand is
  // or in other words:
  // the more cards we have
  // the bigger will be progress
  // and therefore the bigger will be (progress * SPACE_TO_SHRINK)
  // thus the smaller will be the spacing
  const spacing = maxSpacing - progress * SPACE_TO_SHRINK;

  return spacing;
};

export const getHandStartX = (
  cardCount: number,
  spacing: number,
  cardWidth: number,
  baseX: number,
): number => {
  if (cardCount === 0) return baseX - cardWidth / 2;

  const handWidth = (cardCount - 1) * spacing + cardWidth;
  const startX = baseX - handWidth / 2;

  return startX;
};

export const addCardVisual = (
  scene: Phaser.Scene,
  position: Point,
  config: CardConfig,
  borderRadius?: number,
) => {
  const { frame, size } = config;
  const { width, height } = size;
  const { x, y } = position;

  let card;
  if (borderRadius) {
    const scaledRadius = (borderRadius / height) * frame.realHeight;

    const textureKey = createRoundedCardTexture(scene, frame, scaledRadius);
    card = scene.add.image(x, y, textureKey);
  } else {
    card = scene.add.image(x, y, frame.texture, frame.name);
  }

  card.setDisplaySize(width, height).setOrigin(0, 0);

  return card;
};
