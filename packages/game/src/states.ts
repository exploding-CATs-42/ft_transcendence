export const GameStates = {
  WAITING: "waiting",
  WAITING_CONFIRMING: "confirming",
  WAITING_STARTING: "starting",
  PLAYING: "playing",
  CHANGING_TURN: "changingTurn",
  WAITING_FOR_PLAYER_ACTIONS: "waitingForPlayerActions",
  CHECKING_DRAWN_CARD: "checkingDrawnCard",
  EXPLODING_KITTEN_DRAWN: "explodingKittenDrawn",
  WAITING_FOR_DEFUSE_CARD: "waitingForDefuseCard",
  WAITING_FOR_KITTEN_INSERTION: "waitingForKittenInsertion",
  EXPLODING_PLAYER: "explodingPlayer",
} as const;
