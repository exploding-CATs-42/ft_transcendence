import { Game } from "phaser";
import { WaitingRoom } from "./scenes";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [WaitingRoom],
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
