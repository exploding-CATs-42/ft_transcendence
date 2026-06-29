// Events sent TO the machine
export const OpponentEvents = {
  CONFIRM_READINESS: "CONFIRM_READINESS",
  CANCEL_READINESS: "CANCEL_READINESS",
  GAME_STARTED: "GAME_STARTED",
  GAME_ENDED: "GAME_ENDED",
  EXPLODE: "EXPLODE",
  GIVE_CARD: "GIVE_CARD",
  GIVE_ANY_CARD: "GIVE_ANY_CARD",
  START_TURN: "START_TURN",
  DRAW_CARD: "DRAW_CARD",
  TAKE_CARD: "TAKE_CARD",
  PLAY_CARD: "PLAY_CARD",
  END_TURN: "END_TURN",
  GET_ATTACKED: "GET_ATTACKED",
  TURN_COUNT_CHANGED: "TURN_COUNT_CHANGED",
} as const;

export type OpponentEvents =
  (typeof OpponentEvents)[keyof typeof OpponentEvents];

export type OpponentEvent =
  | { type: typeof OpponentEvents.CONFIRM_READINESS }
  | { type: typeof OpponentEvents.CANCEL_READINESS }
  | { type: typeof OpponentEvents.GAME_STARTED }
  | { type: typeof OpponentEvents.GAME_ENDED }
  | { type: typeof OpponentEvents.START_TURN }
  | { type: typeof OpponentEvents.TAKE_CARD }
  | { type: typeof OpponentEvents.DRAW_CARD }
  | { type: typeof OpponentEvents.PLAY_CARD }
  | { type: typeof OpponentEvents.EXPLODE }
  | { type: typeof OpponentEvents.END_TURN }
  | { type: typeof OpponentEvents.GET_ATTACKED; additionalTurnsCount: number }
  | { type: typeof OpponentEvents.TURN_COUNT_CHANGED };

// Events emitted FROM the machine
export const OpponentOutEvents = {
  READINESS_CONFIRMED: "READINESS_CONFIRMED",
  READINESS_CANCELED: "READINESS_CANCELED",
  EXPLODED: "EXPLODED",
  CARD_DRAWN: "CARD_DRAWN",
  CARD_TAKEN: "CARD_TAKEN",
  CARD_PLAYED: "CARD_PLAYED",
} as const;

export type OpponentOutEvents =
  (typeof OpponentOutEvents)[keyof typeof OpponentOutEvents];

export type OpponentOutEvent =
  | { type: typeof OpponentOutEvents.READINESS_CONFIRMED; playerId: string } // which means that we'd need to store player id inside the machine context
  | { type: typeof OpponentOutEvents.READINESS_CANCELED; playerId: string }
  | { type: typeof OpponentOutEvents.EXPLODED }
  | { type: typeof OpponentOutEvents.CARD_DRAWN }
  | { type: typeof OpponentOutEvents.CARD_TAKEN }
  | { type: typeof OpponentOutEvents.CARD_PLAYED };
