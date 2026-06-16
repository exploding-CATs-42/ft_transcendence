import { GameContext } from "game/gameMachine";
import { GameInstance } from "game/types";

export const getGameContext = (gameInstance: GameInstance): GameContext => {
  return gameInstance.getSnapshot().context;
};
