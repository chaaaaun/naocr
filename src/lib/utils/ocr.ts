import Tesseract, { createWorker, PSM } from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

async function initializeWorker() {
    if (!worker) {
        worker = await createWorker('jpn');
        // Configure for Japanese vertical and horizontal text detection
        await worker.setParameters({
            tessedit_char_whitelist: '',
            tessedit_pageseg_mode: PSM.AUTO_OSD, // Automatic page segmentation with OSD
            tessjs_create_hocr: '0',    // Disable HOCR to improve speed
            tessjs_create_tsv: '0',     // Disable TSV to improve speed
        });
    }

    return worker;
}

export async function recognizeText(imageData: ImageData) {
    const worker = await initializeWorker();

    // Create a canvas to convert ImageData to a data URL
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Failed to get 2D context from canvas');
    }
    ctx.putImageData(imageData, 0, 0);

    // Perform OCR
    const result = await worker.recognize(canvas.toDataURL('image/png'));

    // Extract the recognized text
    return result.data.text.trim();
}