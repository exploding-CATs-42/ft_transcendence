// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";
import { EventBus, addBackgroundImage, addFullscreenToggle } from "game/utils";

export class GameRoom extends Scene {
  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);
    EventBus.emit("current-scene-ready", this);
  }
}
