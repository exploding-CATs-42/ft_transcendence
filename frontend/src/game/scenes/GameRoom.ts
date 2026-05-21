// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";
import { EventBus, addBackgroundImage } from "game/utils";

export class GameRoom extends Scene {
  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    addBackgroundImage(this, Textures.gameRoomBg);
    EventBus.emit("current-scene-ready", this);
  }
}
