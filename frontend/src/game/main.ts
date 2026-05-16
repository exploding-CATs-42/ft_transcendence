import { AUTO, Game } from "phaser";
import { WaitingRoom } from "./scenes";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 800,
  height: 600,
  scene: [WaitingRoom],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300, x: 0 },
      debug: false,
    },
  },
};

const StartGame = (parent: HTMLDivElement) => {
  return new Game({ ...config, parent });
};

export default StartGame;
