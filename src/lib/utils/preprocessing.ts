import { Jimp } from "jimp";
import type { BoxCoordinates } from "../../state.svelte";

export interface PreprocessOptions {
  contrast: number;
  brightness: number;
}

/**
 * Preprocesses an image for OCR
 *
 * @param imageData Base64 image data
 * @param boxCoordinates Coordinates of the box to crop
 * @param boxScale Scale of the box to crop (-1 to disable)
 * @returns Base64 image data of the processed image
 */
export async function processImage(
  imageData: string,
  boxCoordinates: BoxCoordinates,
  boxScale: number,
) {
  const image = await Jimp.read(imageData);

  if (boxScale !== -1) {
    image.crop({
      x: boxCoordinates.x * boxScale,
      y: boxCoordinates.y * boxScale,
      w: boxCoordinates.width * boxScale,
      h: boxCoordinates.height * boxScale,
    });
  }

  image
    .greyscale() // Convert to grayscale
    .threshold({ max: 128 }); // Binary threshold (black & white)

  return await image.getBase64("image/png");
}
