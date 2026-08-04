import type { WaitingPlayerView } from "@exploding-cats/contracts";

interface WaitingRoomState {
  players: WaitingPlayerView[];
  meId: string | null;
  countdownEndsAt: number | null;
}

const EMPTY_STATE: WaitingRoomState = {
  players: [],
  meId: null,
  countdownEndsAt: null,
};

let state = EMPTY_STATE;

let listener: (() => void) | null = null;

export const getWaitingState = () => state;

export const setWaitingStateListener = (l: () => void) => {
  listener = l;

  return () => {
    listener = null;
  };
};

export const setState = (patch: Partial<WaitingRoomState>) => {
  state = { ...state, ...patch };
  listener?.();
};
