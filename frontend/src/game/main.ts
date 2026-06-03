import { Game } from "phaser";
import { Boot, Preloader, WaitingRoom, GameRoom } from "./scenes";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./constants";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Boot, Preloader, WaitingRoom, GameRoom],
};

const StartGame = (parent: HTMLDivElement) => {
  return new Game({
    ...config,
    parent,
    scale: {
      ...config.scale,
      fullscreenTarget: parent,
    },
  });
};

export default StartGame;
