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
import { type WaitingPlayerView } from "@exploding-cats/contracts";
import {
  cancelStart,
  confirmStart,
  goToGameRoomWhenStarted,
  leaveWaitingGame,
} from "game/sockets";
import {
  getOpponents,
  isMeConfirmed,
  getWaitingState,
  setWaitingStateListener,
} from "game/store";

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

export class WaitingRoom extends Scene {
  #seats: PlayerSeat[] = [];
  #playersById = new Map<string, GraphicPlayer>();
  #waitingLabel!: Phaser.GameObjects.Text;
  #readyButton!: Button;
  #countdownTimer: Phaser.Time.TimerEvent | null = null;
  #renderedCountdownEndsAt: number | null = null;
  #clearWaitingStateListener: (() => void) | null = null;
  #stopListeningForGameStart: (() => void) | null = null;

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

    this.#clearWaitingStateListener = setWaitingStateListener(this.render);
    this.#stopListeningForGameStart = goToGameRoomWhenStarted(this);

    this.render();
  }

  private cleanup = () => {
    this.#clearWaitingStateListener?.();
    this.#clearWaitingStateListener = null;
    this.#stopListeningForGameStart?.();
    this.#stopListeningForGameStart = null;
    this.#countdownTimer?.remove();
    this.#countdownTimer = null;
  };

  private buildSeats() {
    return WAITING_ROOM_SEATS.map((seat) => {
      return new PlayerSeat(this, seat);
    });
  }

  private render = () => {
    const { countdownEndsAt } = getWaitingState();

    this.renderReadyButton(isMeConfirmed());
    this.renderSeats(getOpponents());
    this.renderCountdown(countdownEndsAt);
  };

  private renderReadyButton = (isConfirmed: boolean) => {
    if (isConfirmed) {
      this.#readyButton.setBackgroundColor(0xff0000);
      this.#readyButton.setText("Cancel");
    } else {
      this.#readyButton.setBackgroundColor(0x61c51b);
      this.#readyButton.setText("Ready");
    }
  };

  private renderSeats = (opponents: WaitingPlayerView[]) => {
    opponents.forEach((opponent) => {
      const seatedPlayer = this.#playersById.get(opponent.id);

      if (seatedPlayer) {
        seatedPlayer.setConfirmed(opponent.isConfirmed);
        seatedPlayer.setConnected(opponent.isConnected);
        return;
      }

      this.addPlayer(opponent);
    });

    const presentIds = new Set(opponents.map((opponent) => opponent.id));

    this.#playersById.forEach((_, playerId) => {
      if (!presentIds.has(playerId)) this.removePlayer(playerId);
    });
  };

  private addPlayer(player: WaitingPlayerView) {
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
    newPlayer.setConfirmed(player.isConfirmed);
    newPlayer.setConnected(player.isConnected);
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
      if (isMeConfirmed()) {
        cancelStart();
      } else {
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

  private renderCountdown = (endsAt: number | null) => {
    if (endsAt === this.#renderedCountdownEndsAt) return;

    this.#renderedCountdownEndsAt = endsAt;
    this.#countdownTimer?.remove();
    this.#countdownTimer = null;

    if (endsAt === null) {
      this.#waitingLabel.setText(WAITING_MESSAGE);
      return;
    }

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
}
