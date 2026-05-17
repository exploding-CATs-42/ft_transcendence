// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes } from "game/constants";

export class WaitingRoom extends Scene {
  constructor() {
    super(Scenes.WaitingRoom);
  }

  init() {}

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#e09d52");
  }

  override update() {}
}
