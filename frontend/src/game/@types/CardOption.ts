import type { CardType } from "@exploding-cats/game-core";

export interface CardOption {
  type: CardType;
  iconTextureKey: string;
  label: string;
}
