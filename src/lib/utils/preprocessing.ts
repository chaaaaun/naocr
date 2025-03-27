import cv from "@techstark/opencv-js";
import { sharedState, type BoxCoordinates } from "../../state.svelte";

/**
 * Preprocesses an image for OCR
 *
 * @param imageDataUrl Image object url
 * @param boxCoordinates Coordinates of the box to crop
 * @param boxScale Scale of the box to crop (-1 to disable)
 * @param ogCanvas Original canvas to display the cropped image
 * @param imgCanvas Canvas to display the processed image
 * @returns Base64 image data of the processed image
 */

export async function preprocessImage(
    imageDataUrl: string,
    boxCoordinates: BoxCoordinates,
    boxScale: number,
    ogCanvas: HTMLCanvasElement,
    imgCanvas: HTMLCanvasElement,
    procMethod: string,
) {

    const img = document.createElement('img');
    img.src = imageDataUrl;
    await new Promise((resolve) => {
        img.onload = resolve;
    });

    const src = cv.imread(img);
    const dst = new cv.Mat();

    cropAndGrayscale(src, dst, boxCoordinates, boxScale);
    src.delete();

    cv.imshow(ogCanvas, dst);

    if (procMethod === "standard") {
        cv.GaussianBlur(dst, dst, { width: 3, height: 3 }, 0);
        cv.medianBlur(dst, dst, 3);
        cv.adaptiveThreshold(dst, dst, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 5, 3);
    } else {
        cv.threshold(dst, dst, 177, 200, cv.THRESH_BINARY + cv.THRESH_OTSU);
    }

    // dst = removeBorderContours(dst);

    cv.imshow(imgCanvas, dst);
    sharedState.processedDataUrl = imgCanvas.toDataURL();
}

function cropAndGrayscale(
    src: cv.Mat,
    dst: cv.Mat,
    boxCoordinates: BoxCoordinates,
    boxScale: number,
) {
    if (boxScale !== -1) {
        const x = boxCoordinates.x * boxScale;
        const y = boxCoordinates.y * boxScale;
        const w = boxCoordinates.width * boxScale;
        const h = boxCoordinates.height * boxScale;

        // Check that the cropping rectangle is within the bounds of the image
        if (x < 0 || y < 0 || x + w > src.cols || y + h > src.rows) {
            throw new Error("Cropping rectangle exceeds image boundaries");
        }

        const rect = new cv.Rect(x, y, w, h);
        src = src.roi(rect);
    }

    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
}

/**
 * Removes contours touching the image borders from a binary image.
 *
 * @param {cv.Mat} binaryMat - The input binary image (cv.CV_8UC1).
 * @returns {cv.Mat | null} A new binary image with border contours removed,
 *                          or null if an error occurs.
 *                          The caller is responsible for deleting the returned Mat.
 */
function removeBorderContours(binaryMat: cv.Mat): cv.Mat | null {
    if (!cv) {
        console.error("OpenCV.js is not ready.");
        return null;
    }
    if (binaryMat.type() !== cv.CV_8UC1) {
        console.error("Input image must be a binary image (CV_8UC1).");
        return null;
    }


    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // This will store the contours we want to keep
    let validContoursMatVector = new cv.MatVector();
    let dst = null; // Initialize result Mat

    const width = binaryMat.cols;
    const height = binaryMat.rows;
    const widthMinus1 = width - 1;
    const heightMinus1 = height - 1;

    // Ensure border pixels are accessible (important check)
    if (width <= 1 || height <= 1) {
        console.warn("Image dimensions are too small to have distinct borders.");
        // Return a copy or an empty image depending on desired behavior
        dst = binaryMat.clone();
        // Clean up intermediate Mats even though they weren't used much
        contours.delete();
        hierarchy.delete();
        validContoursMatVector.delete();
        return dst;
    }


    try {
        // --- 1. Find Contours ---
        // Use RETR_EXTERNAL if you only care about outer contours,
        // or RETR_LIST/RETR_CCOMP/RETR_TREE if you need internal ones too.
        // CHAIN_APPROX_SIMPLE saves memory by storing only endpoints of straight lines.
        cv.findContours(binaryMat, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // --- 2. Iterate through contours ---
        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            let touchesBorder = false;

            // --- 3. Iterate through points of the current contour ---
            // Contour points are stored in a Mat, access data via data32S for int points
            // Data is stored as [x0, y0, x1, y1, ...]
            let data = cnt.data32S; // Int32Array
            for (let j = 0; j < data.length; j += 2) {
                let x = data[j];
                let y = data[j + 1];

                // --- 4. Check if the point is on the border ---
                if (x === 0 || x === widthMinus1 || y === 0 || y === heightMinus1) {
                    touchesBorder = true;
                    break; // No need to check other points for this contour
                }
            }

            // --- 5. Keep contour if it doesn't touch the border ---
            if (!touchesBorder) {
                // Add the valid contour to our list
                validContoursMatVector.push_back(cnt);
            }

            // Don't delete cnt here, it's owned by the 'contours' MatVector
        }

        // --- 6. Create new image and draw valid contours ---
        dst = cv.Mat.zeros(height, width, cv.CV_8UC1); // Create a black image
        let white = new cv.Scalar(255);
        // Draw all contours from validContoursMatVector (-1 means draw all)
        // Use cv.FILLED to fill the shapes, or a positive number (e.g., 1) for outlines
        cv.drawContours(dst, validContoursMatVector, -1, white, cv.FILLED); // Use cv.FILLED to get solid shapes back

        return dst; // Return the Mat with border contours removed

    } catch (error) {
        console.error("Error processing contours:", error);
        if (dst) dst.delete(); // Clean up dst if created before error
        return null; // Indicate failure
    } finally {
        // --- !! IMPORTANT: Clean up OpenCV Mats !! ---
        if (contours) contours.delete();
        if (hierarchy) hierarchy.delete();
        if (validContoursMatVector) validContoursMatVector.delete();
        // binaryMat is an input, caller should manage it.
        // dst is returned, caller must delete it later.
    }
}

// --- Example Usage (assuming you have OpenCV loaded and a binaryMat) ---

/*
// Make sure OpenCV is loaded before calling this
cv.onRuntimeInitialized = () => {
    console.log("OpenCV Ready");

    // Assuming 'canvasInput' is a canvas with your original image
    // and 'canvasOutput' is where you want to display the result.
    const canvasInput = document.getElementById('canvasInput');
    const canvasOutput = document.getElementById('canvasOutput');
    const ctxInput = canvasInput.getContext('2d'); // Needed if drawing source img

    // 1. Get your source image Mat (e.g., from a canvas)
    let src = cv.imread(canvasInput); // Or however you load your image

    // 2. Binarize the image (example using Otsu's thresholding)
    let gray = new cv.Mat();
    let binary = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
    // --> Now 'binary' is your input Mat for the function

    // 3. Remove border contours
    let resultMat = removeBorderContours(binary);

    // 4. Display the result
    if (resultMat) {
        cv.imshow(canvasOutput, resultMat);
        // --- !! IMPORTANT: Delete the returned Mat when done !! ---
        resultMat.delete();
    } else {
        console.error("Failed to remove border contours.");
        // Optionally clear or show an error on the output canvas
        const ctxOutput = canvasOutput.getContext('2d');
        ctxOutput.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
        ctxOutput.fillStyle = 'red';
        ctxOutput.fillText('Processing Error', 10, 20);

    }

    // Clean up intermediate Mats from the example
    src.delete();
    gray.delete();
    binary.delete(); // binary was the input to the function, safe to delete now

    console.log("Processing finished.");
};

*/