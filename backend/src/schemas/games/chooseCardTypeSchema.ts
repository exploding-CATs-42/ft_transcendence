import { z } from "zod";
import { gameId } from "./ids.schema";
import { CardType } from "@exploding-cats/game-core";

export const chooseCardTypeSchema = z.object({
  gameId,
  cardType: z.enum(CardType),
});

export type ChooseCardTypePayload = z.infer<typeof chooseCardTypeSchema>;
