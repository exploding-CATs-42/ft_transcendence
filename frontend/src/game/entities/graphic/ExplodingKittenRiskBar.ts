import type { Point } from "game/@types";
import { Textures } from "game/constants";

export class ExplodingKittenRiskBar extends Phaser.GameObjects.Container {
  #explodingKittensAmount: number = 0;

  #position: Point | null = null;

  #meterSprite: Phaser.GameObjects.Sprite | null = null;
  #probabilityContainer: Phaser.GameObjects.Container | null = null;
  #probabilityLabel: Phaser.GameObjects.Text | null = null;

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

    this.add([this.#meterSprite, this.#probabilityContainer]);
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
    const probability = this.calculateProbability(5);
    const text = this.getProbabilityString(probability);

    const label = scene.add
      .text(0, 0, text, {
        fontFamily: "Chewy",
        fontSize: 20,
        color: "black",
      })
      .setOrigin(0.5);
    return label;
  }

  private getRiskFrame(probability: number) {
    if (probability === 100) return 0;
    else if (probability >= 85) return 1;
    else if (probability >= 65) return 2;
    else if (probability >= 50) return 3;
    else if (probability >= 40) return 4;
    else if (probability >= 25) return 5;
    else return 6;
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
