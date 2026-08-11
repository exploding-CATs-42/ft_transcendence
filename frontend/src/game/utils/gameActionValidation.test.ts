import { describe, expect, it } from "vitest";
import {
  GAME_ACTION_VALIDATION_MESSAGES,
  getCardPlayValidationMessage,
  getDrawCardValidationMessage,
} from "./gameActionValidation";

describe("game action validation", () => {
  it("explains why drawing is blocked outside the player's turn", () => {
    expect(getDrawCardValidationMessage(false)).toBe(
      GAME_ACTION_VALIDATION_MESSAGES.DRAW_OUT_OF_TURN,
    );
    expect(getDrawCardValidationMessage(true)).toBeNull();
  });

  it("prioritizes the turn validation when playing cards", () => {
    expect(
      getCardPlayValidationMessage({
        isMyTurn: false,
        isCombo: false,
        playable: false,
        comboEligible: true,
      }),
    ).toBe(GAME_ACTION_VALIDATION_MESSAGES.PLAY_OUT_OF_TURN);
  });

  it("explains that a non-playable single card requires a combo", () => {
    expect(
      getCardPlayValidationMessage({
        isMyTurn: true,
        isCombo: false,
        playable: false,
        comboEligible: true,
      }),
    ).toBe(GAME_ACTION_VALIDATION_MESSAGES.SINGLE_CARD_REQUIRES_COMBO);
  });

  it("rejects cards that are not eligible for a combo", () => {
    expect(
      getCardPlayValidationMessage({
        isMyTurn: true,
        isCombo: true,
        playable: true,
        comboEligible: false,
      }),
    ).toBe(GAME_ACTION_VALIDATION_MESSAGES.INVALID_COMBO);
  });

  it("allows valid single cards and combos", () => {
    expect(
      getCardPlayValidationMessage({
        isMyTurn: true,
        isCombo: false,
        playable: true,
        comboEligible: false,
      }),
    ).toBeNull();
    expect(
      getCardPlayValidationMessage({
        isMyTurn: true,
        isCombo: true,
        playable: false,
        comboEligible: true,
      }),
    ).toBeNull();
  });
});
