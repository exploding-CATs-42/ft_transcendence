import type {
  CountdownStartedPayload,
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

export const getOpponents = () =>
  state.players.filter((player) => player.id !== state.meId);

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

const patchPlayer = (playerId: string, fields: Partial<WaitingPlayerView>) => {
  setState({
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, ...fields } : player,
    ),
  });
};

export const onPlayerConfirmed = ({ playerId }: PlayerIdPayload) =>
  patchPlayer(playerId, { isConfirmed: true });

export const onPlayerCanceled = ({ playerId }: PlayerIdPayload) =>
  patchPlayer(playerId, { isConfirmed: false });

export const onPlayerDisconnected = ({ playerId }: PlayerIdPayload) =>
  patchPlayer(playerId, { isConnected: false });

export const onPlayerReconnected = ({ playerId }: PlayerIdPayload) =>
  patchPlayer(playerId, { isConnected: true });

export const onCountdownStarted = ({ endsAt }: CountdownStartedPayload) =>
  setState({ countdownEndsAt: endsAt });

export const onCountdownCanceled = () => setState({ countdownEndsAt: null });
