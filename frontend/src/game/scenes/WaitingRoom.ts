// Libraries
import { Scene } from "phaser";
// Project level
import { Scenes, SEATS, Textures } from "game/constants";
import { addBackgroundImage, addFullscreenToggle } from "game/utils";
import { GraphicPlayer, type Player, PlayerSeat } from "game/entities";
import type { LabelConfig } from "game/@types";

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

const NAME_LABEL_CONFIG: LabelConfig = {
  fontColor: "black",
  strokeColor: "white",
};

export class WaitingRoom extends Scene {
  #seats: PlayerSeat[] = [];

  constructor() {
    super(Scenes.WaitingRoom);
  }

  create() {
    this.cameras.main.setBackgroundColor("#e09d52");
    addBackgroundImage(this, Textures.waitingRoomBg);
    addFullscreenToggle(this);

    this.#seats = this.buildSeats();
    this.createPlayers();
  }

  private buildSeats() {
    return SEATS.map((seat) => {
      return new PlayerSeat(this, seat);
    });
  }

  private createPlayers() {
    this.#seats.forEach((seat, i) => {
      const player = data.players[i]!;
      const graphicPlayer = new GraphicPlayer(
        this,
        { x: 0, y: 0 },
        player,
        NAME_LABEL_CONFIG,
      );
      seat.addPlayer(graphicPlayer);
    });
  }
}
