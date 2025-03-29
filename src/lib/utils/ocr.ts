import Tesseract, { createWorker, PSM } from "tesseract.js";
import { Orientation } from "../../state.svelte";
import { get } from "svelte/store";
import { getMecab, type Mecab } from "./mecab";

let horzWorker: Tesseract.Worker | null = null;
let vertWorker: Tesseract.Worker | null = null;
let segmenter: Intl.Segmenter | null = null;

/**
 * Initialize or retrieve the Tesseract worker for the specified text orientation
 *
 * @param orientation The text orientation to use
 * @returns The Tesseract worker for the specified orientation
 * TODO: Add ability to specify pageseg_mode
 */
export async function initWorker(
    orientation: Orientation = Orientation.Horizontal,
) {
    const workerParams = {
        tessedit_pageseg_mode: PSM.AUTO, // Automatic page segmentation with OSD
        chop_enable: "1", // Enable character segmentation
        use_new_state_cost: "0", // Disable new state cost
        segment_segcost_rating: "0", // Disable segment segmentation cost rating
        enable_new_segsearch: "0", // Disable new segmentation search
        language_model_ngram_on: "0", // Disable language model N-gram search
        textord_force_make_prop_words: "1", // Force making words from properties
        edges_max_children_per_outline: "40", // Maximum number of children per outline
    };

    if (!horzWorker) {
        horzWorker = await createWorker("jpn");
        await horzWorker.setParameters(workerParams);
    }

    if (!vertWorker) {
        vertWorker = await createWorker("jpn_vert");
        await vertWorker.setParameters(workerParams);
    }

    return orientation === Orientation.Horizontal ? horzWorker : vertWorker;
}

/**
 * Recognize text in a given image
 *
 * @param imgObjUrl The URL of the image to recognize
 * @param orientation The orientation of the text in the image
 * @returns The recognized text
 */
export async function recognizeText(
    imgObjUrl: string,
    orientation: Orientation,
) {
    console.log(orientation);

    const worker = await initWorker(orientation);

    // Perform OCR
    const result = await worker.recognize(
        imgObjUrl,
        { rotateAuto: false },
        { blocks: true },
    );
    console.log(result);

    const mecab = await getMecab();

    // Extract the recognized text
    return result.data.blocks
        ? result.data.blocks
            .flatMap((block) => block.paragraphs)
            .flatMap((paragraph) => paragraph.lines)
            .flatMap((line) =>
                segmentWords(line.words.map((word) => word.text).join(""), mecab),
            )
        : [];
}

function segmentWords(line: string, mecab: Mecab) {
    return mecab.query(line).map(r => r.word);
}
