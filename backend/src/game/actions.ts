import { GameEvent, GameEventType } from "./events";
import { GameContext } from "./gameMachine";

export interface GameActionArgs {
  context: GameContext;
  event: GameEvent;
}

export const addPlayer = ({ context, event }: GameActionArgs) => {
  if (event.type != GameEventType.JOIN_GAME) return context;

  return {
    players: [...context.players, event.player],
  };
};

export const removePlayer = ({ context, event }: GameActionArgs) => {
  if (event.type != GameEventType.LEAVE_GAME) return context;

  return {
    players: context.players.filter((p) => p.id !== event.playerId),
  };
};
