import { GAME_MACHINE_ID } from "./constants";
import { GameStates } from "./states";

const getStatePath = (...subPath: string[]) => {
  const path = `#${[GAME_MACHINE_ID, ...subPath].join(".")}`;

  return path;
};

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
  CHANGING_TURN: getStatePath(GameStates.PLAYING, GameStates.CHANGING_TURN),
  WAITING_FOR_PLAYER_ACTIONS: getStatePath(
    GameStates.PLAYING,
    GameStates.WAITING_FOR_PLAYER_ACTIONS,
  ),
} as const;
