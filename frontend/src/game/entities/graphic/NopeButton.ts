import { NopeAnimation } from "game/animations";
import { Textures } from "game/constants";

export class NopeButton {
  onClick?: () => void;
  private readonly staticImage: Phaser.GameObjects.Image;
  private readonly animation: NopeAnimation;

  constructor(scene: Phaser.Scene, position: { x: number; y: number }) {
    const { x, y } = position;

    this.staticImage = scene.add.image(x, y, Textures.nope, 0);
    this.staticImage.setVisible(false);
    this.staticImage.setInteractive({ useHandCursor: true });

    this.animation = new NopeAnimation(scene, position);
    this.animation.setVisible(false);
    this.animation.setInteractive({ useHandCursor: true });

    this.staticImage.on("pointerdown", this.handlePointerDown);
    this.animation.on("pointerdown", this.handlePointerDown);
  }

  showStatic(): void {
    this.animation.setVisible(false);
    this.staticImage.setVisible(true);
  }

  showAnimated(): void {
    this.staticImage.setVisible(false);
    this.animation.setVisible(true);
    this.animation.playAnimation();
  }

  hide() {
    this.staticImage.setVisible(false);
    this.animation.stop();
    this.animation.setVisible(false);
  }

  private handlePointerDown = () => {
    if (this.onClick) this.onClick();
  };
}
