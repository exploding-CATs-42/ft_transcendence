import { Scene } from "phaser";
import { background } from "game/assets";
import { Textures } from "game/constants";

export class Boot extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.image(Textures.background, background);
  }

  create() {
    this.scene.start("Preloader");
  }
}
