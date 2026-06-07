export const GAME_MACHINE_ID = "game";

const getStatePath = (...subPath: string[]) => {
  const path = `#${[GAME_MACHINE_ID, ...subPath].join(".")}`;

  return path;
};

export const GameStateType = {
  WAITING: "waiting",
  WAITING_CONFIRMING: "confirming",
  WAITING_STARTING: "starting",
  PLAYING: "playing",
} as const;

export const GameStatePath = {
  WAITING: getStatePath(GameStateType.WAITING),
  WAITING_CONFIRMING: getStatePath(
    GameStateType.WAITING,
    GameStateType.WAITING_CONFIRMING,
  ),
  WAITING_STARTING: getStatePath(
    GameStateType.WAITING,
    GameStateType.WAITING_STARTING,
  ),
  PLAYING: getStatePath(GameStateType.PLAYING),
} as const;
