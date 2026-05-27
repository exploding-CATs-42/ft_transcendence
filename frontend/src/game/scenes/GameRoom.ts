// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, Textures } from "game/constants";
import {
  EventBus,
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

const CARD_WIDTH = 186;
const CARD_HEIGHT = 260;

const CARDS_TO_DEAL = 7;
const HAND_Y = 940; // y position of the player's hand

export class GameRoom extends Scene {
  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);
    addPlayers(this, data.players, "white", "black");

    this.addCards();

    EventBus.emit("current-scene-ready", this);
  }

  private addCards() {
    let x = this.scale.width / 2 - (CARDS_TO_DEAL * CARD_WIDTH) / 2;
    for (let i = 0; i < CARDS_TO_DEAL; ++i) {
      this.add
        .image(x, HAND_Y, Textures.cards, i)
        .setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
        .setOrigin(0, 0);

      x += CARD_WIDTH;
    }
  }
}
