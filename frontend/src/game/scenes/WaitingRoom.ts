// Libraries
import { Scene } from "phaser";
// Project level
import {
  Scenes,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  WAITING_ROOM_SEATS,
  Textures,
} from "game/constants";
import { addBackgroundImage, addFullscreenToggle } from "game/utils";
import { Button, GraphicPlayer, PlayerSeat } from "game/entities";
import type { LabelConfig, Size } from "game/@types";
import {
  type GameStartedPayload,
  type GameStatePayload,
  type WaitingPlayerView,
} from "@exploding-cats/contracts";
import {
  cancelStart,
  confirmStart,
  leaveWaitingGame,
  subscribeWaitingRoom,
  type WaitingRoomHandlers,
} from "game/sockets";

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

const LEAVE_BUTTON_SIZE: Size = {
  width: 260,
  height: 72,
};

const LEAVE_BUTTON_POSITION = {
  x: SCREEN_WIDTH - LEAVE_BUTTON_SIZE.width - 24,
  y: 24,
};

const WAITING_MESSAGE = "Waiting for other players...";

export class WaitingRoom extends Scene implements WaitingRoomHandlers {
  #seats: PlayerSeat[] = [];
  #playersById = new Map<string, GraphicPlayer>();
  #waitingLabel!: Phaser.GameObjects.Text;
  #readyButton!: Button;
  #isReady = false;
  #countdownTimer: Phaser.Time.TimerEvent | null = null;
  #unsubscribe: (() => void) | null = null;

  constructor() {
    super(Scenes.WaitingRoom);
  }

  create() {
    this.cameras.main.setBackgroundColor("#e09d52");
    addBackgroundImage(this, Textures.waitingRoomBg);
    addFullscreenToggle(this);

    this.#seats = this.buildSeats();

    this.addWaitingLabel();
    this.addReadinessButton();
    this.addLeaveGameButton();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup);

    this.#unsubscribe = subscribeWaitingRoom(this);
  }

  private cleanup = () => {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#countdownTimer?.remove();
  };

  private buildSeats() {
    return WAITING_ROOM_SEATS.map((seat) => {
      return new PlayerSeat(this, seat);
    });
  }

  private addPlayer(player: WaitingPlayerView) {
    if (this.#playersById.has(player.id)) return;

    const emptySeat = this.#seats.find((seat) => !seat.player);

    if (!emptySeat) return;

    const newPlayer = new GraphicPlayer(
      this,
      { x: 0, y: 0 },
      {
        id: player.id,
        name: player.name,
        avatarUrl: player.avatarUrl,
        isAlive: true,
      },
      NAME_LABEL_CONFIG,
    );

    this.#playersById.set(player.id, newPlayer);
    this.#playersById.get(player.id)?.setConfirmed(player.isConfirmed);
    emptySeat.addPlayer(newPlayer);
  }

  private removePlayer(playerId: string) {
    const player = this.#playersById.get(playerId);

    if (!player) return;

    this.#seats.forEach((seat) => {
      if (seat.player === player) seat.removePlayer();
    });

    this.#playersById.delete(playerId);
  }

  private addReadinessButton() {
    const onClick = () => {
      if (this.#isReady) {
        this.setReady(false);
        cancelStart();
      } else {
        this.setReady(true);
        confirmStart();
      }
    };

    this.#readyButton = new Button(
      this,
      BUTTON_POSITION,
      BUTTON_SIZE,
      "Ready",
      onClick,
    );
  }

  private setReady(isReady: boolean) {
    this.#isReady = isReady;
    if (isReady) {
      this.#readyButton.setBackgroundColor(0xff0000);
      this.#readyButton.setText("Cancel");
    } else {
      this.#readyButton.setBackgroundColor(0x61c51b);
      this.#readyButton.setText("Ready");
    }
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
    leaveWaitingGame();
  };

  private addWaitingLabel() {
    this.#waitingLabel = this.add
      .text(this.scale.width / 2, this.scale.height / 2, WAITING_MESSAGE, {
        fontSize: 80,
        color: "black",
        fontFamily: "Chewy",
      })
      .setOrigin(0.5, 0);
  }

  onWaitingState = (players: WaitingPlayerView[], isConfirmed: boolean) => {
    players.forEach((player) => this.addPlayer(player));
    this.setReady(isConfirmed);
  };

  onPlayerJoined = (player: WaitingPlayerView) => {
    this.addPlayer(player);
  };

  onPlayerLeft = (playerId: string) => {
    this.removePlayer(playerId);
  };

  onPlayerConfirmed = (playerId: string) => {
    this.#playersById.get(playerId)?.setConfirmed(true);
  };

  onPlayerCanceled = (playerId: string) => {
    this.#playersById.get(playerId)?.setConfirmed(false);
  };

  onCountdownStarted = (endsAt: number) => {
    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      this.#waitingLabel.setText(`Game starts in ${secondsLeft}...`);
    };
    tick();
    this.#countdownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: tick,
    });
  };

  onCountdownCanceled = () => {
    this.#countdownTimer?.remove();
    this.#countdownTimer = null;
    this.#waitingLabel.setText(WAITING_MESSAGE);
  };

  onGameStarted = (payload?: GameStartedPayload | GameStatePayload) => {
    this.scene.start(Scenes.GameRoom, payload);
  };
}
