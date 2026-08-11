export const GAME_ACTION_VALIDATION_MESSAGES = {
  DRAW_OUT_OF_TURN: "You can draw a card only on your turn",
  PLAY_OUT_OF_TURN: "You can play cards only on your turn",
  SINGLE_CARD_REQUIRES_COMBO: "This card can only be played as part of a combo",
  INVALID_COMBO: "These cards cannot be played as a combo",
} as const;

export const getDrawCardValidationMessage = (isMyTurn: boolean) => {
  return isMyTurn ? null : GAME_ACTION_VALIDATION_MESSAGES.DRAW_OUT_OF_TURN;
};

interface CardPlayValidationInput {
  isMyTurn: boolean;
  isCombo: boolean;
  playable: boolean;
  comboEligible: boolean;
}

export const getCardPlayValidationMessage = ({
  isMyTurn,
  isCombo,
  playable,
  comboEligible,
}: CardPlayValidationInput) => {
  if (!isMyTurn) return GAME_ACTION_VALIDATION_MESSAGES.PLAY_OUT_OF_TURN;

  if (isCombo) {
    return comboEligible ? null : GAME_ACTION_VALIDATION_MESSAGES.INVALID_COMBO;
  }

  return playable
    ? null
    : GAME_ACTION_VALIDATION_MESSAGES.SINGLE_CARD_REQUIRES_COMBO;
};
