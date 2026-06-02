// Libraries
import { Scene } from "phaser";
// Project level
import {
  Scenes,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SEATS,
  Textures,
} from "game/constants";
import { addBackgroundImage, addFullscreenToggle } from "game/utils";
import { Button, GraphicPlayer, PlayerSeat, type Player } from "game/entities";
import type { LabelConfig, Point, Size } from "game/@types";

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

const BUTTON_SIZE: Size = {
  width: 350,
  height: 100,
};

const BUTTON_POSITION = {
  x: SCREEN_WIDTH / 2 - BUTTON_SIZE.width / 2,
  y: SCREEN_HEIGHT - 200,
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

    this.addWaitingLabel();

    this.#seats = this.buildSeats();

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

    this.addReadinessButton();
  }

  private buildSeats() {
    return SEATS.map((seat) => {
      return new PlayerSeat(this, seat);
    });
  }

  private addWaitingLabel() {
    this.add
      .text(
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 2,
        "Waiting for other players to join...",
        { fontSize: 80, color: "black", fontFamily: "Chewy" },
      )
      .setOrigin(0.5, 0);
  }

  private addReadinessButton() {
    let ready: boolean = false;
    const onClick = (button: Button) => {
      if (ready) {
        ready = false;
        button.setText("Ready");
      } else {
        ready = true;
        button.setText("Cancel");
      }
    };

    const button = new Button(
      this,
      BUTTON_POSITION,
      BUTTON_SIZE,
      "Ready",
      onClick,
    );
    return button;
  }
}
