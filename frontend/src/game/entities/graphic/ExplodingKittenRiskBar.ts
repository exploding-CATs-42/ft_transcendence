import type { Point } from "game/@types";
import { Textures } from "game/constants";

const METER_ARC = {
  centerOffset: { x: 50, y: 0 },
  radius: 130,
};

const TITLE_CONFIG = {
  text: "KITTEN CHANCE",
  midAngle: Phaser.Math.DegToRad(215),
  letterSpacing: 3.5,
};

const TITLE_TEXT_CONFIG = {
  fontFamily: "Chewy",
  fontSize: 30,
  color: "#d9d9d9",
};

export class ExplodingKittenRiskBar extends Phaser.GameObjects.Container {
  #explodingKittensAmount: number = 0;

  #position: Point | null = null;

  #meterSprite: Phaser.GameObjects.Sprite | null = null;
  #probabilityContainer: Phaser.GameObjects.Container | null = null;
  #probabilityLabel: Phaser.GameObjects.Text | null = null;
  #titleContainer: Phaser.GameObjects.Container | null = null;

  constructor(
    scene: Phaser.Scene,
    position: Point,
    explodingKittensAmount: number,
    drawPileSize: number,
  ) {
    super(scene);
    this.#position = position;
    this.#explodingKittensAmount = explodingKittensAmount;

    this.#meterSprite = this.createMeterSprite(scene);
    this.#probabilityContainer = this.createProbabilityIndicator(scene);
    this.#titleContainer = this.createTitle(scene);

    this.add([
      this.#meterSprite,
      this.#probabilityContainer,
      this.#titleContainer,
    ]);
    this.updateFrame(drawPileSize);
  }

  private createMeterSprite(scene: Phaser.Scene) {
    const { x, y } = this.#position!;
    const bar = scene.add.sprite(x, y, Textures.scaleMeterBar, 0);
    return bar;
  }

  private createProbabilityIndicator(scene: Phaser.Scene) {
    const { x, y } = this.#position!;

    const circle = scene.add.graphics();
    circle.fillStyle(0xd9d9d9);
    circle.fillCircle(0, 0, 25);

    this.#probabilityLabel = this.addLabel(scene);

    const container = scene.add.container(x + 45, y + 7);
    container.add([circle, this.#probabilityLabel]);
    return container;
  }

  // Phaser bends text along a curve with a dynamic bitmap text display
  // callback, but that needs a bitmap font and the game renders Chewy as a web
  // font, so the glyphs are laid out on the arc one by one instead.
  private createTitle(scene: Phaser.Scene) {
    const { x, y } = this.#position!;
    const { centerOffset, radius } = METER_ARC;
    const { text, midAngle, letterSpacing } = TITLE_CONFIG;

    const glyphs = [...text].map((character) =>
      scene.add.text(0, 0, character, { ...TITLE_TEXT_CONFIG }).setOrigin(0.5),
    );

    const gaps = letterSpacing * (glyphs.length - 1);
    const textWidth =
      glyphs.reduce((total, glyph) => total + glyph.width, 0) + gaps;

    // Walk the arc from the start of the text, turning each glyph's advance
    // width into an angle and rotating it to face along the tangent.
    let offset = -textWidth / 2;
    glyphs.forEach((glyph) => {
      offset += glyph.width / 2;

      const angle = midAngle + offset / radius;
      glyph.setPosition(Math.cos(angle) * radius, Math.sin(angle) * radius);
      glyph.setRotation(angle + Math.PI / 2);

      offset += glyph.width / 2 + letterSpacing;
    });

    const container = scene.add.container(
      x + centerOffset.x,
      y + centerOffset.y,
    );
    container.add(glyphs);
    return container;
  }

  private calculateProbability(drawPileSize: number, multiplier: number = 1) {
    if (drawPileSize === 0) return 0;
    else if (drawPileSize === 1) return 100;

    const probability =
      (this.#explodingKittensAmount / drawPileSize) * multiplier * 100;

    return Math.min(probability, 100);
  }

  private getProbabilityString(probability: number) {
    const text = `${probability.toFixed(0)}%`;
    return text;
  }

  private addLabel(scene: Phaser.Scene) {
    const label = scene.add
      .text(0, 0, "", {
        fontFamily: "Chewy",
        fontSize: 20,
        color: "black",
      })
      .setOrigin(0.5);
    return label;
  }

  private getRiskFrame(probability: number) {
    if (probability === 100) return 0;
    if (probability >= 85) return 1;
    if (probability > 50) return 2;
    if (probability === 50) return 3;
    if (probability >= 40) return 4;
    if (probability >= 25) return 5;
    return 6;
  }

  updateFrame(drawPileSize: number) {
    if (drawPileSize <= 0) return;

    const probability = this.calculateProbability(drawPileSize, 1);

    const frame = this.getRiskFrame(probability);
    this.#meterSprite?.setFrame(frame);

    const text = this.getProbabilityString(probability);
    this.#probabilityLabel?.setText(text);
  }
}
