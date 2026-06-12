import { CardDefinition } from "./cardDefinition";

export type Card = Omit<CardDefinition, "count"> & {
  id: string;
};
