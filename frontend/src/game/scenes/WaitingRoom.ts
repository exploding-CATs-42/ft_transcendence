// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";
import { addBackgroundImage } from "game/utils";
import type { Player } from "game/entities";
import { SEATS } from "game/constants";

// It's just a placeholder and has to be removed later
const data: { players: Player[] } = {
  players: [
    { username: "You", imageUrl: null },
    { username: "Player 2", imageUrl: null },
    { username: "Player 3", imageUrl: null },
    { username: "Player 4", imageUrl: null },
    { username: "Player 5", imageUrl: null },
  ],
};

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
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#e09d52");
    addBackgroundImage(this, Textures.waitingRoomBg);
    this.addFullscreenToggleButton();

    this.addPlayers(data.players);
    this.addWaitingLabel();
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

  private addPlayers(players: Player[]) {
    players.forEach((player, i) => {
      const { x, y } = SEATS[i]!;
      const avatar = this.add.image(x, y, Textures.avatar).setOrigin(0, 0);

      const radius = Math.min(avatar.displayWidth, avatar.displayHeight) / 2;
      const cx = x + radius;
      const cy = y + radius;

      avatar.setPosition(cx, cy).setOrigin(0.5, 0.5);

      const mask = this.add.graphics();
      mask.fillCircle(cx, cy, radius);
      avatar.setMask(mask.createGeometryMask());

      this.add
        .text(cx, cy - radius - 30, player.username, {
          fontSize: 32,
          color: "black",
          fontFamily: "Chewy",
        })
        .setOrigin(0.5, 0.5);
    });
  }

  private addWaitingLabel() {
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2,
        "Waiting for other players to join...",
        { fontSize: 80, color: "black", fontFamily: "Chewy" },
      )
      .setOrigin(0.5, 0);
  }
}
