import * as tf from '@tensorflow/tfjs';

export interface PreprocessOptions {
    contrast: number;
    brightness: number;
}

export async function preprocessImage(imageData: ImageData, canvas: HTMLCanvasElement, options: PreprocessOptions = { contrast: 1.5, brightness: 1.2 }): Promise<ImageData> {
    const { contrast, brightness } = options;

    try {
        // Get dimensions
        const { width, height } = imageData;

        // Convert ImageData to tensor
        const imageTensor = tf.browser.fromPixels(imageData, 4); // RGBA

        // Split the channels
        const [r, g, b, a] = tf.split(imageTensor, 4, 2);

        // Convert to grayscale for better text detection
        // Weighted conversion based on human perception: 0.299*R + 0.587*G + 0.114*B
        const grayscale = tf.add(
            tf.add(
                tf.mul(r, tf.scalar(0.299)),
                tf.mul(g, tf.scalar(0.587))
            ),
            tf.mul(b, tf.scalar(0.114))
        );

        // Apply brightness and contrast
        // Formula: pixel = (pixel - 128) * contrast + 128 + brightness
        let processed = tf.add(
            tf.add(
                tf.mul(
                    tf.sub(grayscale, tf.scalar(128)),
                    tf.scalar(contrast)
                ),
                tf.scalar(128)
            ),
            tf.scalar(brightness)
        );

        // Apply adaptive thresholding
        // First, create a blurred version of the image for the adaptive threshold
        const blurred = tf.avgPool(
            processed.expandDims(0) as tf.Tensor4D,
            [11, 11],  // kernel size
            [1, 1],    // strides
            'same'     // padding
        ).squeeze();

        // Apply the threshold: if pixel > blurred pixel - 10, set to 255, else 0
        const threshold = tf.sub(blurred, tf.scalar(10));
        const binary = tf.greater(processed, threshold).toFloat().mul(tf.scalar(255));

        // Combine the channels back together
        // Alpha remains the same for transparency
        const processedRgba = tf.stack([binary, binary, binary, a], 2);

        // Draw the processed image back to the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }

        const processedImageData = new ImageData(
            Uint8ClampedArray.from(await processedRgba.data()),
            width,
            height
        );
        ctx.putImageData(processedImageData, 0, 0);

        // Clean up tensors
        tf.dispose([imageTensor, r, g, b, a, grayscale, processed, blurred, threshold, binary, processedRgba]);

        return processedImageData;
    } catch (error) {
        console.error('Image processing error:', error);
        // Fall back to original image in case of error
        return imageData;
    }
}