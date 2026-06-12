// Libraries
import { z } from "zod";
// Project level
import rawCards from "../../constants/cards.json";
// Local level
import {
  CardDefinitionSchema,
  CardDefinition,
} from "../types/cards/cardDefinition";

const CardsSchema = z.array(CardDefinitionSchema);

export const getParsedCardDefinitions = (): CardDefinition[] => {
  return CardsSchema.parse(rawCards);
};
