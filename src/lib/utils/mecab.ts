/**
 * Represents the result of a MeCab morphological analysis for a single morpheme.
 * Based on the standard MeCab output format:
 * Surface-POS,POS-subcat1,POS-subcat2,POS-subcat3,Conjugation-type,Conjugation-form,Lemma,Reading,Pronunciation
 */
export interface MecabResult {
    /** The surface form of the word as it appears in the text. */
    word: string;
    /** Part-of-speech tag (e.g., 名詞, 動詞, 助詞). */
    pos: string;
    /** Part-of-speech sub-category 1 (e.g., 一般, 自立, 格助詞). */
    pos_detail1: string;
    /** Part-of-speech sub-category 2. Often '*' if not applicable. */
    pos_detail2: string;
    /** Part-of-speech sub-category 3. Often '*' if not applicable. */
    pos_detail3: string;
    /** Conjugation type (e.g., 五段・ラ行, 一段, カ変・クル). Often '*' if not applicable. */
    conjugation1: string;
    /** Conjugation form (e.g., 基本形, 未然形, 連用形). Often '*' if not applicable. */
    conjugation2: string;
    /** The dictionary (lemma) form of the word. */
    dictionary_form: string;
    /** The reading of the word, usually in Katakana. */
    reading: string;
    /** The pronunciation of the word, usually in Katakana. May differ from reading for things like particles. */
    pronunciation: string;
}

/**
 * Provides static methods to interact with the MeCab morphological analyzer loaded via WebAssembly.
 */
export interface Mecab {
    /**
     * Waits for the underlying WebAssembly module (libmecab) to be loaded and initialized.
     * This promise must resolve successfully before `query` can be called.
     */
    waitReady(): Promise<void>;

    /**
     * Performs morphological analysis on the input string using the initialized MeCab instance.
     *
     * Throws an error if `waitReady()` has not completed successfully before this method is called.
     *
     * @param str The Japanese text string to analyze.
     * @returns An array of `MecabResult` objects, each representing a morpheme found in the string.
     *          Returns an empty array if the analysis fails for the given string (e.g., internal MeCab error).
    */
    query(str: string): MecabResult[];
}


const DEPENDENCY_URL = 'https://unpkg.com/mecab-wasm@1.0.2/lib/mecab.js';

// Once the import starts, it holds the pending promise.
// Once resolved/rejected, it holds the settled promise.
let dependencyPromise: Promise<Mecab> | null = null;

/**
 * Loads the external dependency using dynamic import.
 * Ensures the import is only attempted once.
 *
 * @returns A Promise that resolves with the loaded dependency or rejects on error.
 */
export function getMecab(): Promise<Mecab> {
    if (!dependencyPromise) {
        console.log('Trying to load mecab-wasm from web...');

        dependencyPromise = (async () => {
            try {
                const module: any = await import(/* @vite-ignore */ DEPENDENCY_URL);
                const dependency: Mecab = module.default
                if (!dependency) {
                    throw new Error(`Loaded module structure unexpected. Found: ${Object.keys(module).join(', ')}`);
                }

                console.log('mecab-wasm loaded successfully.');
                return dependency;

            } catch (error) {
                console.error('Failed to load external dependency:', error);
                throw error;
            }
        })();
    }

    return dependencyPromise;
}
