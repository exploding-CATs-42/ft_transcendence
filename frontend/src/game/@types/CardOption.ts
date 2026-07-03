import type { CardType } from "@exploding-cats/game-core";

export interface CardOption {
  type: CardType;
  iconFrameIndex: number;
  label: string;
}
