import { Scene } from "phaser";
import { sky, star2 as star, dude, bomb, platform } from "game/assets";

type ImageFrameConfig = Phaser.Types.Loader.FileTypes.ImageFrameConfig;

const DUDE_FRAME_CONFIG: ImageFrameConfig = {
  frameWidth: 32,
  frameHeight: 48,
};

const ASSETS = {
  star: star,
  ground: platform,
  sky: sky,
  bomb: bomb,
  dude: dude,
} as const;

type AssetKey = keyof typeof ASSETS;

export class WaitingRoom extends Scene {
  // ------------ Typed wrappers ------------
  private loadImage(key: AssetKey, url: string) {
    return this.load.image(key, url);
  }

  private loadSpritesheet(
    key: AssetKey,
    url: string,
    config: ImageFrameConfig,
  ) {
    return this.load.spritesheet(key, url, config);
  }

  private addImage(x: number, y: number, key: AssetKey) {
    return this.add.image(x, y, key);
  }

  // ------------ Lifecycle methods ------------

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private stars!: Phaser.Physics.Arcade.Group;
  private bombs!: Phaser.Physics.Arcade.Group;

  private score!: number;
  private scoreText!: Phaser.GameObjects.Text;

  private gameOver!: boolean;

  preload() {
    this.loadImage("star", ASSETS["star"]);
    this.loadImage("ground", platform);
    this.loadImage("sky", sky);
    this.loadImage("bomb", bomb);
    this.loadSpritesheet("dude", dude, DUDE_FRAME_CONFIG);
  }

  create() {
    this.addImage(0, 0, "sky").setOrigin(0, 0);

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.player = this.physics.add.sprite(100, 450, "dude");

    // this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.player.body.setGravityY(300);

    this.physics.add.collider(this.player, this.platforms);

    this.cursors =
      this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child) => {
      const star = child as Phaser.Physics.Arcade.Sprite;
      star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
    });

    this.physics.add.collider(this.stars, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      undefined,
      this,
    );

    this.scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: 32,
      fill: "#000",
    });

    this.score = 0;

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      undefined,
      this,
    );

    this.gameOver = false;
  }

  override update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) &&
      this.player.body.touching.down
    ) {
      this.player.setVelocityY(-500);
    }
  }

  private collectStar: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    star,
  ) => {
    const collectedStar = star as Phaser.Physics.Arcade.Sprite;

    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
    collectedStar.disableBody(true, true);

    if (this.stars.countActive() === 0) {
      this.stars.children.iterate((child) => {
        const star = child as Phaser.Physics.Arcade.Sprite;
        star.enableBody(true, star.x, 0, true, true);
        return true;
      });

      const x =
        this.player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  };

  private hitBomb: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    _bomb,
  ) => {
    this.physics.pause();
    this.player.setTint(0xff00000);
    this.player.anims.play("turn");
    this.gameOver = true;
  };
}
