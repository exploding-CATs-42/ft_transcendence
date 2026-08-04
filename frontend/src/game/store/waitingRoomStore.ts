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

const state = EMPTY_STATE;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let listener: (() => void) | null = null;

export const getWaitingState = () => state;

export const setWaitingStateListener = (l: () => void) => {
  listener = l;

  return () => {
    listener = null;
  };
};
