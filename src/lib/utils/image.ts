import type { BoxCoordinates } from "../../state.svelte";

/**
 * Convert an ImageBitmap to a data URL
 *
 * @param imageBitmap The ImageBitmap to convert
 * @returns A data URL representing the ImageBitmap as PNG
 * @throws If the canvas 2D context cannot be created
 */
export function toDataUrl(imageBitmap: ImageBitmap) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas 2D context");
  }

  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  ctx.drawImage(imageBitmap, 0, 0);

  return canvas.toDataURL("image/png");
}

/**
 * Crop an ImageBitmap to a specific area
 *
 * @param imageBitmap The ImageBitmap to crop
 * @param coords The BoxCoordinates of the area to crop
 * @param scale The scale factor to apply to the coordinates in case the ImageBitmap is scaled
 * @returns A new ImageBitmap representing the cropped area
 * @throws If the canvas 2D context cannot be created
 */
export function cropImageBitmap(
  imageBitmap: ImageBitmap,
  coords: BoxCoordinates,
  scale: number = 1,
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create canvas 2D context");
  }

  const x = coords.x * scale;
  const y = coords.y * scale;
  const width = coords.width * scale;
  const height = coords.height * scale;

  // Set canvas size to match crop dimensions
  canvas.width = width;
  canvas.height = height;

  // Draw the cropped area from the ImageBitmap
  ctx.drawImage(imageBitmap, x, y, width, height, 0, 0, width, height);

  // Convert the cropped canvas back to an ImageBitmap
  return createImageBitmap(canvas);
}
