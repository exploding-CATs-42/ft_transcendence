import { Textures } from "game/constants";

/**
 * Creates (or reuses) a rounded-corner texture derived from a Phaser texture frame.
 */
export const createRoundedCardTexture = (
  scene: Phaser.Scene,
  frame: Phaser.Textures.Frame,
  radius: number,
) => {
  const textureKey = `rounded_card_${frame.name}`;
  if (scene.textures.exists(textureKey)) return textureKey;

  const w = frame.realWidth;
  const h = frame.realHeight;

  // Create a new canvas-based texture in Phaser's Texture Manager.
  // This texture will later be used like any other image in the game.
  const canvasTexture = scene.textures.createCanvas(textureKey, w, h)!;
  const ctx = canvasTexture.context;

  // Save the current canvas state so we can safely modify clip paths
  // without affecting any future drawing operations on this context.
  // In our case it's unnecessary, but if we'd want to add any
  // other modifications to this texture in the future it is needed
  ctx.save();

  {
    // Define a rounded-rectangle clipping region.
    // Everything drawn after this will be masked by this shape.
    applyRoundedClip(ctx, w, h, radius);

    // img is the original spritesheet image
    const img = frame.source.image as HTMLImageElement;

    // This reads as:
    // Take this rectangle of pixels from img
    // (defined by frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight)
    // and draw it onto the canvas at position (0, 0) scaled to size (w, h).
    ctx.drawImage(
      img,
      frame.cutX,
      frame.cutY,
      frame.cutWidth,
      frame.cutHeight,
      0,
      0,
      w,
      h,
    );
  }

  // restore canvas context
  ctx.restore();

  // Notify Phaser that the canvas content has changed
  // and must be uploaded to the GPU / refreshed for rendering.
  canvasTexture.refresh();

  return textureKey;
};

const applyRoundedClip = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  radius: number,
) => {
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, radius);
  ctx.clip();
};

export const getRoundedAvatarTexture = (
  scene: Phaser.Scene,
  sourceKey: string = Textures.avatar,
) => {
  const textureKey = `rounded_${sourceKey}`;
  // Avoid recreating texture
  if (scene.textures.exists(textureKey)) return textureKey;

  // Get original image source
  const sourceImage = scene.textures
    .get(sourceKey)
    .getSourceImage() as HTMLImageElement;

  const size = Math.min(sourceImage.width, sourceImage.height);
  const radius = size / 2;

  // Create canvas texture
  const canvasTexture = scene.textures.createCanvas(textureKey, size, size)!;

  const canvas = canvasTexture.getSourceImage() as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Create circular clipping path
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw original image inside clipped area
  ctx.drawImage(sourceImage, 0, 0, size, size);

  // Refresh Phaser texture
  canvasTexture.refresh();

  return textureKey;
};

export const getCardFrame = (scene: Phaser.Scene, frameIndex: number) => {
  const cardSpreadsheet = scene.textures.get(Textures.cards);
  const frame = cardSpreadsheet.get(frameIndex);
  return frame;
};
