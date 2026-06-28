import type { GameInstance, GameContext } from "../entities/Game";

export const getGameContext = (gameInstance: GameInstance): GameContext => {
  return gameInstance.getSnapshot().context;
};
