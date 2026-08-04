import type {
  PlayerIdPayload,
  PlayerJoinedPayload,
  WaitingPlayerView,
  WaitingStatePayload,
} from "@exploding-cats/contracts";

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

const setState = (patch: Partial<WaitingRoomState>) => {
  state = { ...state, ...patch };
  listener?.();
};

export const onWaitingState = ({
  waitingState,
  meId,
  countdownEndsAt,
}: WaitingStatePayload) => {
  setState({ players: waitingState.players, meId, countdownEndsAt });
};

export const onPlayerJoined = ({ player }: PlayerJoinedPayload) => {
  const others = state.players.filter((p) => p.id !== player.id);

  setState({ players: [...others, player] });
};

export const onPlayerLeft = ({ playerId }: PlayerIdPayload) => {
  setState({ players: state.players.filter((p) => p.id !== playerId) });
};
