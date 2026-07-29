import { describe, expect, it } from "vitest";
import { getSelectedCardTint } from "./cardSelectionUtils";

describe("getSelectedCardTint", () => {
  it("returns no tint when no cards are selected", () => {
    expect(getSelectedCardTint(0)).toBeNull();
  });

  it.each([
    [1, 0xfff4a8],
    [2, 0xffd45a],
    [3, 0xffa52c],
  ])("returns the tint for %i selected cards", (selectedCount, tint) => {
    expect(getSelectedCardTint(selectedCount)).toBe(tint);
  });

  it("caps the tint at the three-card selection style", () => {
    expect(getSelectedCardTint(4)).toBe(0xffa52c);
  });
});
