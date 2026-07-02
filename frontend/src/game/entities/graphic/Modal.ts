const MODAL_DEPTH = 10000;

export class Modal extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private content: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    super(scene);

    this.background = this.initBackground(scene);
    this.content = this.initContentContainer(scene);
    this.add([this.background, this.content]);
    this.setDepth(MODAL_DEPTH);

    scene.add.existing(this);
  }

  setContent(container: Phaser.GameObjects.Container) {
    this.content.removeAll(true);

    const bounds = container.getBounds();
    container.x = -(bounds.x + bounds.width / 2);
    container.y = -(bounds.y + bounds.height / 2);

    this.content.add(container);
  }

  private initBackground(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    // darkened transparent overlay
    const background = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.6,
    );
    // Prevent clicks from going through the modal background
    background.setInteractive();

    return background;
  }

  private initContentContainer(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const contentContainer = scene.add.container(width / 2, height / 2);
    return contentContainer;
  }
}
