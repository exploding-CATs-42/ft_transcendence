// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";

export class WaitingRoom extends Scene {
  constructor() {
    super(Scenes.WaitingRoom);
  }

  init() {}

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#e09d52");
    this.add.image(0, 0, Textures.avatar).setOrigin(0, 0);
    this.add.text(20, 200, "Username", {
      fontSize: 32,
      color: "black",
    });
  }

  override update() {}
}
