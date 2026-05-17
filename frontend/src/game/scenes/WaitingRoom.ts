// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";

export class WaitingRoom extends Scene {
  constructor() {
    super(Scenes.WaitingRoom);
  }

  init() {
    this.input.keyboard?.on("keydown-F", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Or via a button click:
    document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
      this.scale.toggleFullscreen();
    });

    this.addFullscreenToggleButton();
  }

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

  private addFullscreenToggleButton() {
    const button = this.add.dom(
      0,
      0,
      "button",
      "position: absolute; bottom: 12px; right: 12px; font-size: 32px; color: black;",
      "CLICK ME",
    );

    button.addListener("click");
    button.on("click", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });
  }
}
