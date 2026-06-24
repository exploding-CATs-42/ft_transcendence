import { machineId } from "./constants";
import { PlayerStates } from "./states";

export const PlayerTargets = {
  IN_LOBBY: `#${machineId}.${PlayerStates.IN_LOBBY}`,
  READY: `#${machineId}.${PlayerStates.IN_LOBBY}.${PlayerStates.READY}`,
  NOT_READY: `#${machineId}.${PlayerStates.IN_LOBBY}.${PlayerStates.NOT_READY}`,
  IN_GAME: `#${machineId}.${PlayerStates.IN_GAME}`,
  ALIVE: `#${machineId}.${PlayerStates.IN_GAME}.${PlayerStates.ALIVE}`,
  MAKING_TURN: `#${machineId}.${PlayerStates.IN_GAME}.${PlayerStates.ALIVE}.${PlayerStates.MAKING_TURN}`,
  NORMAL: `#${machineId}.${PlayerStates.IN_GAME}.${PlayerStates.ALIVE}.${PlayerStates.NORMAL}`,
  UNDER_ATTACK: `#${machineId}.${PlayerStates.IN_GAME}.${PlayerStates.ALIVE}.${PlayerStates.UNDER_ATTACK}`,
  WAITING_FOR_TURN: `#${machineId}.${PlayerStates.IN_GAME}.${PlayerStates.ALIVE}.${PlayerStates.WAITING_FOR_TURN}`,
  DEAD: `#${machineId}.${PlayerStates.IN_GAME}.${PlayerStates.DEAD}`,
  AFTER_GAME: `#${machineId}.${PlayerStates.AFTER_GAME}`,
} satisfies Record<keyof typeof PlayerStates, string>;
