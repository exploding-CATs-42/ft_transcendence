export const PrivateEventType = {
  LEFT_GAME: "left-game",
  WAITING_STATE: "waiting-state",
  YOUR_HAND: "YOUR_HAND",
  CARD_RECEIVED: "CARD_RECEIVED",
  CARD_REMOVED: "CARD_REMOVED",
  SEE_THE_FUTURE_PEEK: "SEE_THE_FUTURE_PEEK",
  DEFUSE_PROMPT: "DEFUSE_PROMPT",
  INSERT_KITTEN_PROMPT: "INSERT_KITTEN_PROMPT",
  FAVOR_MUST_GIVE: "FAVOR_MUST_GIVE",
} as const;

export type PrivateEventType =
  (typeof PrivateEventType)[keyof typeof PrivateEventType];
