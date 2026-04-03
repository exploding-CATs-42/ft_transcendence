import { CardType } from "./card";

export enum ClientActionType {
  PLAY_CARD = "PLAY_CARD",
  PLAY_COMBO = "PLAY_COMBO",
  PLAY_NOPE = "PLAY_NOPE",
  DRAW_CARD = "DRAW_CARD",
  PLAY_DEFUSE = "PLAY_DEFUSE",
  INSERT_KITTEN = "INSERT_KITTEN",
  FAVOR_GIVE = "FAVOR_GIVE"
}

export interface PlayCardAction {
  type: ClientActionType.PLAY_CARD;
  cardInstanceId: string;
  targetPlayerId?: string;
}

export interface PlayComboAction {
  type: ClientActionType.PLAY_COMBO;
  cardInstanceIds: string[];
  targetPlayerId: string;
  namedCardType?: CardType;
}

export interface PlayNopeAction {
  type: ClientActionType.PLAY_NOPE;
  cardInstanceId: string;
}

export interface PlayDefuseAction {
  type: ClientActionType.PLAY_DEFUSE;
  cardInstanceId: string;
}

export interface InsertKittenAction {
  type: ClientActionType.INSERT_KITTEN;
  positionIndex: number;
}

export interface FavorGiveAction {
  type: ClientActionType.FAVOR_GIVE;
  cardInstanceId: string;
}

export interface DrawCardAction {
  type: ClientActionType.DRAW_CARD;
}

export type ClientAction =
  | PlayCardAction
  | PlayComboAction
  | PlayNopeAction
  | PlayDefuseAction
  | InsertKittenAction
  | FavorGiveAction
  | DrawCardAction;
