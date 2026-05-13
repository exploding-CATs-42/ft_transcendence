import { GameContext, MachineEvent } from "./types";

export const isCurrentPlayer = ({
  context,
  event
}: {
  context: GameContext;
  event: MachineEvent;
}) => {
  const current = context.players[context.currentPlayerIndex];
  return current?.playerId === event.playerId;
};
