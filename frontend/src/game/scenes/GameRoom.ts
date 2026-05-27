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

export class GameRoom extends Scene {
  constructor() {
    super(Scenes.GameRoom);
  }

  create() {
    addBackgroundImage(this, Textures.gameRoomBg);
    addFullscreenToggle(this);
    addPlayers(this, data.players, "white", "black");
    EventBus.emit("current-scene-ready", this);
  }
}
