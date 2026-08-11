import { ServerErrorEvents } from "@exploding-cats/contracts";

export const GAME_SESSION_ERROR_EVENTS = [
  ServerErrorEvents.LEAVE_GAME_ERROR,
  ServerErrorEvents.RECONNECT_GAME_ERROR,
  ServerErrorEvents.CONFIRM_START_ERROR,
  ServerErrorEvents.CANCEL_START_ERROR,
] as const;

export const GAME_ROOM_ERROR_EVENTS = [
  ServerErrorEvents.DRAW_CARD_ERROR,
  ServerErrorEvents.PLAY_CARD_ERROR,
  ServerErrorEvents.PLAY_COMBO_ERROR,
  ServerErrorEvents.PLAY_DEFUSE_ERROR,
  ServerErrorEvents.INSERT_KITTEN_ERROR,
  ServerErrorEvents.PLAY_NOPE_ERROR,
  ServerErrorEvents.SELECT_PLAYER_ERROR,
  ServerErrorEvents.SEEN_THE_FUTURE_ERROR,
  ServerErrorEvents.CHOOSE_CARD_ID_ERROR,
  ServerErrorEvents.CHOOSE_CARD_INDEX_ERROR,
  ServerErrorEvents.CHOOSE_CARD_TYPE_ERROR,
] as const;

export type GameRoomErrorEvent = (typeof GAME_ROOM_ERROR_EVENTS)[number];
