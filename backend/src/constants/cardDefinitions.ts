// Libraries
import { z } from "zod";
// Project level
import { CardDefinitionSchema } from "../game/types/cards/cardDefinition";
// Local level
import rawCards from "./cards.json";

const CardsSchema = z.array(CardDefinitionSchema);
export const cardDefinitions = CardsSchema.parse(rawCards);
