// Libraries
import { Scene } from "phaser";
// Local level
import { leaveFinishedGame, type GameOverRoomHandlers } from "game/sockets";
import { Scenes, SCREEN_HEIGHT, SCREEN_WIDTH, Textures } from "game/constants";
import { Button } from "game/entities";
import type { Point, Size } from "game/@types";
import { addFullscreenToggle } from "game/utils";
import { GameOverAnimation } from "game/animations";
import type { GameOverPayload } from "@exploding-cats/game-core";

const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;

const LEAVE_BUTTON_SIZE: Size = {
  width: 260,
  height: 72,
};

const LEAVE_BUTTON_POSITION: Point = {
  x: SCREEN_WIDTH - LEAVE_BUTTON_SIZE.width - 24,
  y: 24,
};

const BACKDROP_ALPHA = 0.35;

const CAT_SIZE: Size = {
  width: 700,
  height: 700,
};

const CAT_POSITION: Point = {
  x: CENTER_X + 220,
  y: SCREEN_HEIGHT - 330,
};

const WINNER_LABEL_POSITION: Point = {
  x: CENTER_X,
  y: CENTER_Y - 100,
};

const WINNER_LABEL_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "Chewy",
  fontSize: "96px",
  color: "#ffd166",
  stroke: "black",
  strokeThickness: 10,
  align: "center",
};

const UNKNOWN_WINNER_NAME = "Unknown Player";

export class GameOverRoom extends Scene implements GameOverRoomHandlers {
  #winnerName = UNKNOWN_WINNER_NAME;

  constructor() {
    super(Scenes.GameOverRoom);
  }

  init(payload?: Partial<GameOverPayload>) {
    this.#winnerName = payload?.winner?.name ?? UNKNOWN_WINNER_NAME;
  }

  create() {
    this.addExplosionBackground();
    this.addBackdrop();
    this.addCoolCat();
    this.addWinnerLabel();

    addFullscreenToggle(this);
    this.addLeaveGameButton();
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  private addWinnerLabel() {
    const nameText = this.add.text(0, 0, this.#winnerName, {
      ...WINNER_LABEL_STYLE,
      color: "#ff0000",
    });

    const winnerText = this.add.text(
      nameText.width,
      0,
      " survived this game",
      WINNER_LABEL_STYLE,
    );

    const container = this.add.container(
      WINNER_LABEL_POSITION.x,
      WINNER_LABEL_POSITION.y,
      [nameText, winnerText],
    );

    // Center the whole sentence
    container.setSize(nameText.width + winnerText.width, nameText.height);
    container.setPosition(
      WINNER_LABEL_POSITION.x - container.width / 2,
      WINNER_LABEL_POSITION.y - container.height / 2,
    );

    this.tweens.add({
      targets: [winnerText, nameText],
      alpha: { from: 0, to: 1 },
      ease: "Sine.easeOut",
      duration: 600,
      delay: 300,
    });
  }

  private addCoolCat() {
    const { width, height } = CAT_SIZE;

    const cat = this.add
      .image(CAT_POSITION.x, CAT_POSITION.y, Textures.coolCat)
      .setOrigin(0.5)
      .setDisplaySize(width, height);

    this.tweens.add({
      targets: cat,
      displayWidth: { from: 0, to: width },
      displayHeight: { from: 0, to: height },
      ease: "Back.easeOut",
      duration: 600,
    });
  }

  private addBackdrop() {
    this.add
      .rectangle(
        CENTER_X,
        SCREEN_HEIGHT / 2,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        0x000000,
        BACKDROP_ALPHA,
      )
      .setOrigin(0.5);
  }

  private addLeaveGameButton() {
    const button = new Button(
      this,
      LEAVE_BUTTON_POSITION,
      LEAVE_BUTTON_SIZE,
      "Leave game",
      this.leaveGame,
    );

    button.setBackgroundColor(0xc73535);
  }

  private addExplosionBackground() {
    const explosion = new GameOverAnimation(
      this,
      { x: CENTER_X, y: SCREEN_HEIGHT / 2 },
      { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    );

    explosion.playAnimation();
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  private leaveGame = () => {
    leaveFinishedGame();
  };
}
