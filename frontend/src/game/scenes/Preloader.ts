// Libraries
import { Scene } from "phaser";
// Project level
import { Textures, Scenes } from "game/constants";
import { avatar } from "game/assets";

export class Preloader extends Scene {
  constructor() {
    super(Scenes.Preloader);
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.addBackgroundImage(Textures.background);
    this.addProgressBar();
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.image(Textures.avatar, avatar);
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the Game scene. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start(Scenes.WaitingRoom);
  }

  private addBackgroundImage(texture: string) {
    const bg = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      texture,
    );

    const scaleX = this.scale.width / bg.width;
    const scaleY = this.scale.height / bg.height;
    const scale = Math.max(scaleX, scaleY);

    bg.setOrigin(0.5);
    bg.setScale(scale);

    return bg;
  }

  private addProgressBar() {
    //  A simple progress bar
    const progressBarWidth = 468;
    const progressBarHeight = 32;
    const marginBottom = 100;

    // Center horizontally
    const x = this.scale.width / 2;

    // Position from bottom
    const y = this.scale.height - marginBottom;

    // Progress bar outline
    this.add
      .rectangle(x, y, progressBarWidth, progressBarHeight)
      .setStrokeStyle(1, 0xffffff);

    // This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(
      x - progressBarWidth / 2 + 2,
      y,
      4,
      progressBarHeight - 4,
      0xffffff,
    );

    // Anchor from the left side
    bar.setOrigin(0, 0.5);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      bar.width = (progressBarWidth - 4) * progress;
    });
  }
}
