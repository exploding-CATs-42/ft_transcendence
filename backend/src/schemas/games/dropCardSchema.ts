import { z } from "zod";
import { gameId } from "./ids.schema";
import { CardType } from "@exploding-cats/game-core";

export const dropCardSchema = z.object({
  gameId,
  cardType: z.enum(Object.values(CardType) as [CardType, ...CardType[]]),
});

export type DropCardParams = z.infer<typeof dropCardSchema>;
