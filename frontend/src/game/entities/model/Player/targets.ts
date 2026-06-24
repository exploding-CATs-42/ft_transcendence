import { machineId } from "./constants";
import { PlayerStates } from "./states";

const {
  IN_LOBBY,
  READY,
  NOT_READY,
  IN_GAME,
  ALIVE,
  MAKING_TURN,
  NORMAL,
  UNDER_ATTACK,
  WAITING_FOR_TURN,
  DEAD,
  AFTER_GAME,
} = PlayerStates;

const target = (...subStates: string[]) => {
  return `#${[machineId, ...subStates].join(".")}`;
};

export const PlayerTargets = {
  IN_LOBBY: target(IN_LOBBY),
  READY: target(IN_LOBBY, READY),
  NOT_READY: target(IN_LOBBY, NOT_READY),
  IN_GAME: target(IN_GAME),
  ALIVE: target(IN_GAME, ALIVE),
  MAKING_TURN: target(IN_GAME, ALIVE, MAKING_TURN),
  NORMAL: target(IN_GAME, ALIVE, MAKING_TURN, NORMAL),
  UNDER_ATTACK: target(IN_GAME, ALIVE, MAKING_TURN, UNDER_ATTACK),
  WAITING_FOR_TURN: target(IN_GAME, ALIVE, WAITING_FOR_TURN),
  DEAD: target(IN_GAME, DEAD),
  AFTER_GAME: target(AFTER_GAME),
} satisfies Record<keyof typeof PlayerStates, string>;
