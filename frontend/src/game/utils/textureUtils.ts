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
