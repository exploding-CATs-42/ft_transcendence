// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";
import {
  addBackgroundImage,
  addFullscreenToggle,
  addPlayers,
} from "game/utils";
import type { Player } from "game/entities";

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

  init() {}

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor("#e09d52");
    addBackgroundImage(this, Textures.waitingRoomBg);
    addFullscreenToggle(this);

    addPlayers(this, data.players, "black");
    this.addWaitingLabel();
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
