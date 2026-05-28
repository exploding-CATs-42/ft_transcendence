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

export const addPlayerConfirmation = ({ context, event }: GameActionArgs) => {
  if (event.type !== GameEventType.CONFIRM_START) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isConfirmed: true } : p,
    ),
  };
};

export const removePlayerConfirmation = ({
  context,
  event,
}: GameActionArgs) => {
  if (event.type !== GameEventType.CANCEL_START) return context;

  return {
    players: context.players.map((p) =>
      p.id === event.playerId ? { ...p, isConfirmed: false } : p,
    ),
  };
};
