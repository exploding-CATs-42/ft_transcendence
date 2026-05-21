// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes } from "game/constants";
import { EventBus } from "game/utils";

export class GameRoom extends Scene {
  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    EventBus.emit("current-scene-ready", this);
  }
}
