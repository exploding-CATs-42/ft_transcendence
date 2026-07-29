const SELECTED_CARD_TINT_BY_COUNT = {
  1: 0xfff4a8,
  2: 0xffd45a,
  3: 0xffa52c,
} as const;

type SelectedCardCount = keyof typeof SELECTED_CARD_TINT_BY_COUNT;

export const getSelectedCardTint = (selectedCardCount: number) => {
  if (selectedCardCount < 1) return null;

  const normalizedCount = Math.min(selectedCardCount, 3) as SelectedCardCount;
  return SELECTED_CARD_TINT_BY_COUNT[normalizedCount];
};
