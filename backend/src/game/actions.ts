import { GameEvent, GameEventType } from "./events";
import { GameContext } from "./gameMachine";

export interface GameActionArgs {
  context: GameContext;
  event: GameEvent;
}

export const addPlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEventType.JOIN_GAME) return context;

  return {
    players: [...context.players, event.player],
  };
};

export const removePlayer = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEventType.LEAVE_GAME) return context;

  return {
    players: context.players.filter((p) => p.id !== event.playerId),
  };
};

export const markPlayerReady = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEventType.MARK_READY) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isReady: true } : p,
    ),
  };
};

export const markPlayerUnready = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEventType.MARK_UNREADY) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isReady: false } : p,
    ),
  };
};
