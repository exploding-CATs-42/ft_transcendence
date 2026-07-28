// Libraries
import { Scene } from "phaser";
// Local level
import { leaveFinishedGame, type GameOverRoomHandlers } from "game/sockets";
import { Scenes, SCREEN_HEIGHT, SCREEN_WIDTH } from "game/constants";
import { Button } from "game/entities";
import type { Point, Size } from "game/@types";
import { addFullscreenToggle } from "game/utils";
import { GameOverAnimation } from "game/animations";

const CENTER_X = SCREEN_WIDTH / 2;

const LEAVE_BUTTON_SIZE: Size = {
  width: 260,
  height: 72,
};

const LEAVE_BUTTON_POSITION: Point = {
  x: SCREEN_WIDTH - LEAVE_BUTTON_SIZE.width - 24,
  y: 24,
};

const BACKDROP_ALPHA = 0.35;

export class GameOverRoom extends Scene implements GameOverRoomHandlers {
  constructor() {
    super(Scenes.GameOverRoom);
  }

  create() {
    this.addExplosionBackground();
    this.addBackdrop();

    addFullscreenToggle(this);
    this.addLeaveGameButton();
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

  private leaveGame = () => {
    leaveFinishedGame();
  };
}
