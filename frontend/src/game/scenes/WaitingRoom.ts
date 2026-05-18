// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";
import { addBackgroundImage } from "game/utils";

export class WaitingRoom extends Scene {
  constructor() {
    super(Scenes.WaitingRoom);
  }

  init() {
    this.input.keyboard?.on("keydown-F", () => {
      this.scale.toggleFullscreen();
    });

    document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
      this.scale.toggleFullscreen();
    });

    this.addFullscreenToggleButton();
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#e09d52");
    addBackgroundImage(this, Textures.waitingRoomBg);
    this.addPlayers();
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

  private addPlayers() {
    type Point = { x: number; y: number };
    type Player = { position: Point; name: string };

    const players: Player[] = [
      { position: { x: 44, y: 700 }, name: "You" },
      { position: { x: 120, y: 200 }, name: "Player 1" },
      { position: { x: 602, y: 90 }, name: "Player 2" },
      { position: { x: 1098, y: 90 }, name: "Player 3" },
      { position: { x: 1600, y: 180 }, name: "Player 4" },
    ];

    players.forEach(({ position: { x, y }, name }) => {
      const avatar = this.add.image(x, y, Textures.avatar).setOrigin(0, 0);

      const radius = Math.min(avatar.displayWidth, avatar.displayHeight) / 2;
      const cx = x + radius;
      const cy = y + radius;

      avatar.setPosition(cx, cy).setOrigin(0.5, 0.5);

      const mask = this.add.graphics();
      mask.fillCircle(cx, cy, radius);
      avatar.setMask(mask.createGeometryMask());

      this.add
        .text(cx, cy - radius - 30, name, {
          fontSize: 32,
          color: "black",
          fontFamily: "Chewy",
        })
        .setOrigin(0.5, 0.5);
    });
  }
}
