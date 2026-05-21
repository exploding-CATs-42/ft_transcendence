// Libraries
import { Scene } from "phaser";
// Project level
import { preloaderBg } from "game/assets";
import { Scenes, Textures } from "game/constants";

export class Boot extends Scene {
  constructor() {
    super(Scenes.Boot);
  }

  preload() {
    //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
    //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
    this.load.image(Textures.preloaderBg, preloaderBg);
  }

  create() {
    this.scene.start(Scenes.Preloader);
  }
}
