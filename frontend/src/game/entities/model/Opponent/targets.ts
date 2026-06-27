import { machineId } from "./constants";
import { OpponentStates } from "./states";

// This destructuring allows to make the actual target definitions shorter
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
} = OpponentStates;

const target = (...subStates: string[]) => {
  return `#${[machineId, ...subStates].join(".")}`;
};

export const OpponentTargets = {
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
} satisfies Record<keyof typeof OpponentStates, string>;
// Thanks to the "satisfies" trick
// the OpponentTargets will never go out of sync with the OpponentStates
