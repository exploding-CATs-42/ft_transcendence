// Libraries
import { Scene } from "phaser";
// Local level
import { type GameOverRoomHandlers } from "game/sockets";
import { Scenes } from "game/constants";

export class GameOverRoom extends Scene implements GameOverRoomHandlers {
  constructor() {
    super(Scenes.GameOverRoom);
  }
}
