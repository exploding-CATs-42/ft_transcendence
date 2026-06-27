import { machineId } from "./constants";
import { PlayerStates } from "./states";

// This destructuring allows to make the actual target definitions shorter
const { IN_LOBBY, READY, NOT_READY, IN_GAME, AFTER_GAME } = PlayerStates;

const target = (...subStates: string[]) => {
  return `#${[machineId, ...subStates].join(".")}`;
};

export const PlayerTargets = {
  IN_LOBBY: target(IN_LOBBY),
  READY: target(IN_LOBBY, READY),
  NOT_READY: target(IN_LOBBY, NOT_READY),
  IN_GAME: target(IN_GAME),
  AFTER_GAME: target(AFTER_GAME),
} satisfies Record<keyof typeof PlayerStates, string>;
// Thanks to the "satisfies" trick
// the PlayerTargets will never go out of sync with the PlayerStates
