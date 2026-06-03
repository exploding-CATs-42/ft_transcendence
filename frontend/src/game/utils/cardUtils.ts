export const getCardSpacing = (
  cardCount: number,
  minSpacing: number,
  maxSpacing: number,
  maxCount: number,
): number => {
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
