export const GAME_MACHINE_ID = "game";

export const GameStateType = {
  WAITING: "waiting",
  WAITING_CONFIRMING: "confirming",
  WAITING_STARTING: "starting",
  PLAYING: "playing",
} as const;

export const GameStatePath = {
  WAITING: `#${GAME_MACHINE_ID}.${GameStateType.WAITING}`,
  WAITING_CONFIRMING: `#${GAME_MACHINE_ID}.${GameStateType.WAITING}.${GameStateType.WAITING_CONFIRMING}`,
  WAITING_STARTING: `#${GAME_MACHINE_ID}.${GameStateType.WAITING}.${GameStateType.WAITING_STARTING}`,
  PLAYING: `#${GAME_MACHINE_ID}.${GameStateType.PLAYING}`,
} as const;
