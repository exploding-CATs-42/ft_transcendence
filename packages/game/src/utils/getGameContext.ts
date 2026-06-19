import type { GameContext } from "../gameMachine";
import type { GameInstance } from "../types";

export const getGameContext = (gameInstance: GameInstance): GameContext => {
  return gameInstance.getSnapshot().context;
};
