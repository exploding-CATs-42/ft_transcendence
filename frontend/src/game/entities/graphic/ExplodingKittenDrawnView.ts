import {
  CARD_TYPE_TO_FRAME,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "game/constants";
import type { CardConfig } from "game/@types";
import { addCardVisual, getCardFrame } from "game/utils";

const DEPTH = 10000;

const CENTER_X = SCREEN_WIDTH / 2;

const BACKDROP = {
  color: 0x000000,
  alpha: 0.72,
} as const;

const CARD = {
  width: 372,
  height: 520,
  top: 170,
  borderRadius: 20,
} as const;

const HEADER = {
  y: 80,
  text: "You drew an Exploding Kitten!",
  fontSize: 60,
} as const;

const COUNTDOWN = {
  y: CARD.top + CARD.height + 60,
  fontSize: 84,
} as const;

const BUTTON = {
  width: 360,
  height: 96,
  y: COUNTDOWN.y + 100,
  borderRadius: 16,
  color: 0x61c51b,
  colorPressed: 0x3c7a11,
  fontSize: 46,
} as const;

const HELPER = {
  y: BUTTON.y + BUTTON.height + 40,
  fontSize: 32,
  withDefuse: "Use a Defuse card before time runs out.",
  withoutDefuse: "You have no Defuse card left...",
} as const;

const URGENT_SECONDS = 3;
const COLOR_NORMAL = "#ffffff";
const COLOR_URGENT = "#ff5b5b";

export class ExplodingKittenDrawnView extends Phaser.GameObjects.Container {
  /** Fired exactly once when the player commits to defusing. */
  onDefuse?: () => void;

  #endsAt: number;
  #canDefuse: boolean;

  #countdownLabel!: Phaser.GameObjects.Text;
  #button?: Phaser.GameObjects.Container;
  #buttonBackground?: Phaser.GameObjects.Graphics;

  #timer?: Phaser.Time.TimerEvent | undefined;
  #defuseRequested = false;

  constructor(scene: Phaser.Scene, endsAt: number, canDefuse: boolean) {
    super(scene);

    this.#endsAt = endsAt;
    this.#canDefuse = canDefuse;

    scene.add.existing(this);
    this.setDepth(DEPTH);

    this.add(this.buildBackdrop(scene));
    this.add(this.buildHeader(scene));
    const card = this.buildCard(scene);
    this.add(card);
    this.#countdownLabel = this.buildCountdown(scene);
    this.add(this.#countdownLabel);
    if (canDefuse) this.add(this.buildButton(scene));
    this.add(this.buildHelper(scene));

    this.playEntranceAnimation(scene, card);
    this.startCountdown(scene);
  }

  // ==============================
  // Builders
  // ==============================

  private buildBackdrop(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
    const backdrop = scene.add
      .rectangle(
        CENTER_X,
        SCREEN_HEIGHT / 2,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        BACKDROP.color,
        BACKDROP.alpha,
      )
      .setInteractive(); // swallow clicks meant for the board behind it

    return backdrop;
  }

  private buildHeader(scene: Phaser.Scene): Phaser.GameObjects.Text {
    return scene.add
      .text(CENTER_X, HEADER.y, HEADER.text, {
        fontFamily: "Chewy",
        fontSize: HEADER.fontSize,
        color: COLOR_NORMAL,
        stroke: "black",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5, 0);
  }

  private buildCard(scene: Phaser.Scene): Phaser.GameObjects.Image {
    const frame = getCardFrame(scene, CARD_TYPE_TO_FRAME["EXPLODING_KITTEN"]);

    const config: CardConfig = {
      frame,
      size: { width: CARD.width, height: CARD.height },
    };

    // addCardVisual anchors at the top-left corner.
    const position = { x: CENTER_X - CARD.width / 2, y: CARD.top };

    return addCardVisual(scene, position, config, CARD.borderRadius);
  }

  private buildCountdown(scene: Phaser.Scene): Phaser.GameObjects.Text {
    return scene.add
      .text(CENTER_X, COUNTDOWN.y, "", {
        fontFamily: "Chewy",
        fontSize: COUNTDOWN.fontSize,
        color: COLOR_NORMAL,
        stroke: "black",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5);
  }

  private buildButton(scene: Phaser.Scene): Phaser.GameObjects.Container {
    const { width, height, y, borderRadius, color, fontSize } = BUTTON;

    const container = scene.add.container(CENTER_X - width / 2, y);

    const background = scene.add.graphics();
    background.fillStyle(color, 1);
    background.fillRoundedRect(0, 0, width, height, borderRadius);

    const label = scene.add
      .text(width / 2, height / 2, "Defuse", {
        fontFamily: "Chewy",
        fontSize,
        color: "black",
      })
      .setOrigin(0.5, 0.5);

    container.add([background, label]);
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, width, height),
      Phaser.Geom.Rectangle.Contains,
    );
    container.input!.cursor = "pointer";
    container.on("pointerdown", this.handleDefusePressed);

    this.#button = container;
    this.#buttonBackground = background;

    return container;
  }

  private buildHelper(scene: Phaser.Scene): Phaser.GameObjects.Text {
    const text = this.#canDefuse ? HELPER.withDefuse : HELPER.withoutDefuse;

    return scene.add
      .text(CENTER_X, HELPER.y, text, {
        fontFamily: "Chewy",
        fontSize: HELPER.fontSize,
        color: "#d7d7d7",
      })
      .setOrigin(0.5, 0);
  }

  // ==============================
  // Interaction
  // ==============================

  private handleDefusePressed = () => {
    // Guard against duplicate taps: only the first press counts.
    if (this.#defuseRequested || !this.#canDefuse) return;

    this.#defuseRequested = true;
    this.disableButton();
    this.onDefuse?.();
  };

  private disableButton() {
    const button = this.#button;
    const background = this.#buttonBackground;
    if (!button || !background) return;

    button.disableInteractive();

    background.clear();
    background.fillStyle(BUTTON.colorPressed, 1);
    background.fillRoundedRect(
      0,
      0,
      BUTTON.width,
      BUTTON.height,
      BUTTON.borderRadius,
    );
    button.setAlpha(0.6);
  }

  // ==============================
  // Countdown
  // ==============================

  private startCountdown(scene: Phaser.Scene) {
    const tick = () => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((this.#endsAt - Date.now()) / 1000),
      );

      this.#countdownLabel.setText(`${secondsLeft}`);
      this.#countdownLabel.setColor(
        secondsLeft <= URGENT_SECONDS ? COLOR_URGENT : COLOR_NORMAL,
      );

      if (secondsLeft <= 0) {
        this.#timer?.remove();
        this.#timer = undefined;
        // Timer ran out: block further defuse attempts and wait for the
        // server's elimination logic to drive the next state.
        this.disableButton();
      }
    };

    tick();
    this.#timer = scene.time.addEvent({
      delay: 200,
      loop: true,
      callback: tick,
    });
  }

  // ==============================
  // Animations & lifecycle
  // ==============================

  private playEntranceAnimation(
    scene: Phaser.Scene,
    card: Phaser.GameObjects.Image,
  ) {
    this.setAlpha(0);
    scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
      ease: "Sine.easeOut",
    });

    scene.tweens.add({
      targets: card,
      scaleX: { from: card.scaleX * 0.8, to: card.scaleX },
      scaleY: { from: card.scaleY * 0.8, to: card.scaleY },
      duration: 350,
      ease: "Back.Out",
    });
  }

  override destroy(fromScene?: boolean) {
    this.#timer?.remove();
    this.#timer = undefined;
    super.destroy(fromScene);
  }
}
