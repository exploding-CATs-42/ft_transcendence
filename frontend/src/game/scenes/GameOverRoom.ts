// Libraries
import { Scene } from "phaser";
// Local level
import { leaveFinishedGame, type GameOverRoomHandlers } from "game/sockets";
import { Scenes, SCREEN_WIDTH } from "game/constants";
import { Button } from "game/entities";
import type { Point, Size } from "game/@types";
import { addFullscreenToggle } from "game/utils";

const LEAVE_BUTTON_SIZE: Size = {
  width: 260,
  height: 72,
};

const LEAVE_BUTTON_POSITION: Point = {
  x: SCREEN_WIDTH - LEAVE_BUTTON_SIZE.width - 24,
  y: 24,
};

export class GameOverRoom extends Scene implements GameOverRoomHandlers {
  constructor() {
    super(Scenes.GameOverRoom);
  }

  create() {
    addFullscreenToggle(this);
    this.addLeaveGameButton();
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

  private leaveGame = () => {
    leaveFinishedGame();
  };
}
