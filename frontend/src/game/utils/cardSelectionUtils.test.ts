import { describe, expect, it } from "vitest";
import { getSelectedCardOutlineColor } from "./cardSelectionUtils";

describe("getSelectedCardOutlineColor", () => {
  it("returns no outline color when no cards are selected", () => {
    expect(getSelectedCardOutlineColor(0)).toBeNull();
  });

  it.each([
    [1, 0xfff4a8],
    [2, 0xffd45a],
    [3, 0xffa52c],
  ])(
    "returns the outline color for %i selected cards",
    (selectedCount, color) => {
      expect(getSelectedCardOutlineColor(selectedCount)).toBe(color);
    },
  );

  it("caps the outline color at the three-card selection style", () => {
    expect(getSelectedCardOutlineColor(4)).toBe(0xffa52c);
  });
});
