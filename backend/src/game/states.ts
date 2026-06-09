export const GAME_MACHINE_ID = "game";

const getStatePath = (...subPath: string[]) => {
  const path = `#${[GAME_MACHINE_ID, ...subPath].join(".")}`;

  return path;
};

export const GameStates = {
  WAITING: "waiting",
  WAITING_CONFIRMING: "confirming",
  WAITING_STARTING: "starting",
  PLAYING: "playing",
} as const;

export const GameTargets = {
  WAITING: getStatePath(GameStates.WAITING),
  WAITING_CONFIRMING: getStatePath(
    GameStates.WAITING,
    GameStates.WAITING_CONFIRMING,
  ),
  WAITING_STARTING: getStatePath(
    GameStates.WAITING,
    GameStates.WAITING_STARTING,
  ),
  PLAYING: getStatePath(GameStates.PLAYING),
} as const;
